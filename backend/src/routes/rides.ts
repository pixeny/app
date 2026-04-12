import express from 'express';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../index';

const router = express.Router();

router.post('/request', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const {
      origin,
      destination,
      payment_method = 'balance'
    } = req.body;

    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      throw createError('Origin and destination coordinates are required', 400);
    }

    const distance = calculateDistance(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );

    const baseFare = 5;
    const distanceRate = 2;
    const fare = Math.round(baseFare + (distance * distanceRate));

    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        id: uuidv4(),
        rider_id: userId,
        origin,
        destination,
        status: 'pending',
        fare,
        distance: Math.round(distance * 100) / 100,
        duration: Math.round(distance * 3),
        payment_method,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw createError('Failed to create ride request', 500);
    }

    const { data: nearbyDrivers } = await supabase
      .from('drivers')
      .select('*')
      .eq('is_online', true)
      .not('current_location', 'is', null);

    if (nearbyDrivers && nearbyDrivers.length > 0) {
      io.emit('new-ride-request', {
        rideId: ride.id,
        origin,
        destination,
        fare,
        distance: ride.distance
      });
    }

    res.status(201).json({
      message: 'Ride request created successfully',
      ride
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let query;
    if (userRole === 'rider') {
      query = supabase
        .from('rides')
        .select(`
          *,
          drivers!rides_driver_id_fkey (
            *,
            users!drivers_user_id_fkey (
              full_name,
              phone
            )
          )
        `)
        .eq('rider_id', userId)
        .in('status', ['pending', 'accepted', 'in_progress']);
    } else {
      query = supabase
        .from('rides')
        .select(`
          *,
          users!rides_rider_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('driver_id', userId)
        .in('status', ['accepted', 'in_progress']);
    }

    const { data: rides, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw createError('Failed to fetch active rides', 500);
    }

    res.json({ rides: rides || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/:rideId/accept', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { rideId } = req.params;

    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (driverError || !driver) {
      throw createError('Driver profile not found', 404);
    }

    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .eq('status', 'pending')
      .single();

    if (rideError || !ride) {
      throw createError('Ride not found or not available', 404);
    }

    const { data: updatedRide, error: updateError } = await supabase
      .from('rides')
      .update({
        driver_id: userId,
        status: 'accepted'
      })
      .eq('id', rideId)
      .select()
      .single();

    if (updateError) {
      throw createError('Failed to accept ride', 500);
    }

    io.to(`ride-${rideId}`).emit('ride-accepted', {
      ride: updatedRide,
      driver: {
        full_name: driver.full_name,
        phone: driver.phone,
        car_make: driver.car_make,
        car_model: driver.car_model,
        license_plate: driver.license_plate
      }
    });

    res.json({
      message: 'Ride accepted successfully',
      ride: updatedRide
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:rideId/start', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { rideId } = req.params;

    const { data: ride, error } = await supabase
      .from('rides')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', rideId)
      .eq('driver_id', userId)
      .eq('status', 'accepted')
      .select()
      .single();

    if (error || !ride) {
      throw createError('Failed to start ride', 500);
    }

    io.to(`ride-${rideId}`).emit('ride-started', { ride });

    res.json({
      message: 'Ride started successfully',
      ride
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:rideId/complete', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { rideId } = req.params;

    const { data: ride, error } = await supabase
      .from('rides')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', rideId)
      .eq('driver_id', userId)
      .eq('status', 'in_progress')
      .select()
      .single();

    if (error || !ride) {
      throw createError('Failed to complete ride', 500);
    }

    if (ride.payment_method === 'balance') {
      const { data: balance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', ride.rider_id)
        .single();

      if (balance && balance.balance >= ride.fare) {
        await supabase
          .from('user_balances')
          .update({ balance: balance.balance - ride.fare })
          .eq('user_id', ride.rider_id);

        await supabase
          .from('payments')
          .insert({
            id: uuidv4(),
            ride_id: rideId,
            user_id: ride.rider_id,
            amount: ride.fare,
            method: 'balance',
            status: 'completed'
          });

        await supabase
          .from('user_balances')
          .upsert({
            user_id: userId,
            balance: (balance?.balance || 0) + ride.fare
          });
      }
    }

    await supabase
      .from('drivers')
      .update({
        total_trips: supabase.rpc('increment', { x: 1 })
      })
      .eq('user_id', userId);

    io.to(`ride-${rideId}`).emit('ride-completed', { ride });

    res.json({
      message: 'Ride completed successfully',
      ride
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:rideId/cancel', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { rideId } = req.params;

    const { data: ride, error } = await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId)
      .or(`rider_id.eq.${userId},driver_id.eq.${userId}`)
      .in('status', ['pending', 'accepted'])
      .select()
      .single();

    if (error || !ride) {
      throw createError('Failed to cancel ride', 500);
    }

    io.to(`ride-${rideId}`).emit('ride-cancelled', { ride });

    res.json({
      message: 'Ride cancelled successfully',
      ride
    });
  } catch (error) {
    next(error);
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;
