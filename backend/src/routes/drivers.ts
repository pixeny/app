import express from 'express';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/register', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const {
      license_number,
      car_make,
      car_model,
      car_year,
      car_color,
      license_plate
    } = req.body;

    if (!license_number || !car_make || !car_model || !car_year || !car_color || !license_plate) {
      throw createError('All driver fields are required', 400);
    }

    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingDriver) {
      throw createError('Driver already registered', 409);
    }

    const { data: driver, error } = await supabase
      .from('drivers')
      .insert({
        id: uuidv4(),
        user_id: userId,
        license_number,
        car_make,
        car_model,
        car_year,
        car_color,
        license_plate,
        is_online: false,
        rating: 5.0,
        total_trips: 0
      })
      .select()
      .single();

    if (error) {
      throw createError('Driver registration failed', 500);
    }

    res.status(201).json({
      message: 'Driver registered successfully',
      driver
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data: driver, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !driver) {
      throw createError('Driver profile not found', 404);
    }

    res.json(driver);
  } catch (error) {
    next(error);
  }
});

router.put('/status', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { is_online } = req.body;

    if (typeof is_online !== 'boolean') {
      throw createError('is_online must be a boolean', 400);
    }

    const { data: driver, error } = await supabase
      .from('drivers')
      .update({ is_online })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !driver) {
      throw createError('Failed to update driver status', 500);
    }

    res.json({
      message: 'Driver status updated successfully',
      driver
    });
  } catch (error) {
    next(error);
  }
});

router.put('/location', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      throw createError('Latitude and longitude are required', 400);
    }

    const { data: driver, error } = await supabase
      .from('drivers')
      .update({
        current_location: { lat, lng }
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !driver) {
      throw createError('Failed to update location', 500);
    }

    res.json({
      message: 'Location updated successfully',
      driver
    });
  } catch (error) {
    next(error);
  }
});

router.get('/nearby', async (req: AuthRequest, res, next) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      throw createError('Latitude and longitude are required', 400);
    }

    const { data: drivers, error } = await supabase
      .from('drivers')
      .select(`
        *,
        users!drivers_user_id_fkey (
          full_name,
          phone
        )
      `)
      .eq('is_online', true)
      .not('current_location', 'is', null);

    if (error) {
      throw createError('Failed to fetch nearby drivers', 500);
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const maxRadius = parseFloat(radius as string);

    const nearbyDrivers = drivers?.filter(driver => {
      if (!driver.current_location) return false;
      
      const distance = calculateDistance(
        userLat,
        userLng,
        driver.current_location.lat,
        driver.current_location.lng
      );
      
      return distance <= maxRadius;
    }) || [];

    res.json({
      drivers: nearbyDrivers
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
