import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { generateRandomDrivers, updateRandomDriverLocation } from './drivers-generator';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Generate random drivers
const randomDrivers = generateRandomDrivers(8);
const drivers = new Map();
const rides = new Map();

// Initialize drivers map
randomDrivers.forEach(driver => {
  drivers.set(driver.id, driver);
});

// Update driver locations periodically
setInterval(() => {
  drivers.forEach((driver, id) => {
    if (driver.is_online && !driver.is_busy) {
      const updatedDriver = updateRandomDriverLocation(driver);
      drivers.set(id, updatedDriver);
    }
  });
}, 5000); // Update every 5 seconds

// Test endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock driver accounts
  if (email.includes('driver')) {
    const driverId = email.includes('1') ? 'driver-1' : 'driver-2';
    const driver = drivers.get(driverId);
    res.json({
      message: 'Login successful',
      token: 'mock-driver-token',
      user: {
        id: driverId,
        email,
        full_name: driver?.full_name || 'Driver',
        phone: driver?.phone || '+995123456789',
        role: 'driver',
        balance: 100
      }
    });
    return;
  }
  
  // Mock rider authentication
  res.json({
    message: 'Login successful',
    token: 'mock-token',
    user: {
      id: 'mock-user-id',
      email,
      full_name: 'Test User',
      phone: '+995123456789',
      role: 'rider',
      balance: 50
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name, phone, role } = req.body;
  res.json({
    message: 'Registration successful',
    token: 'mock-token',
    user: {
      id: 'mock-user-id',
      email,
      full_name,
      phone,
      role,
      balance: 0
    }
  });
});

app.get('/api/users/profile', (req, res) => {
  res.json({
    id: 'mock-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+995123456789',
    role: 'rider',
    balance: 50
  });
});

app.get('/api/drivers/nearby', (req, res) => {
  const { lat, lng, radius = 5 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }

  // Get available drivers
  const availableDrivers = Array.from(drivers.values()).filter(driver => 
    driver.is_online && !driver.is_busy
  );

  // Add user info to drivers
  const driversWithUsers = availableDrivers.map(driver => ({
    ...driver,
    users: {
      full_name: driver.full_name,
      phone: driver.phone
    }
  }));

  res.json({ drivers: driversWithUsers });
});

app.post('/api/rides/request', (req, res) => {
  const { origin, destination } = req.body;
  
  // Find available drivers (online and not busy)
  const availableDrivers = Array.from(drivers.values()).filter(driver => 
    driver.is_online && !driver.is_busy
  );
  
  if (availableDrivers.length === 0) {
    return res.status(404).json({
      error: 'No available drivers at the moment',
      message: 'All drivers are currently busy. Please try again later.'
    });
  }
  
  const ride = {
    id: 'ride-' + Date.now(),
    rider_id: 'mock-user-id',
    driver_id: null, // No driver assigned yet
    origin,
    destination,
    status: 'pending', // Wait for driver to accept
    fare: 15.50 + Math.random() * 10, // Random fare between 15.50 and 25.50
    distance: 5.2,
    duration: 15,
    payment_method: 'balance',
    payment_status: 'pending',
    created_at: new Date().toISOString()
  };
  
  rides.set(ride.id, ride);
  
  // Send ride request to available drivers
  io.emit('new-ride-request', {
    rideId: ride.id,
    origin: ride.origin,
    destination: ride.destination,
    fare: ride.fare,
    distance: ride.distance * 1000 // Convert to meters
  });
  
  res.json({
    message: 'Ride request created - waiting for driver',
    ride
  });
});

app.post('/api/drivers/register', (req, res) => {
  const { license_number, car_make, car_model, car_year, car_color, license_plate } = req.body;
  
  const driverId = 'driver-1'; // Fixed driver ID for demo
  const driver = {
    id: driverId,
    license_number,
    car_make,
    car_model,
    car_year,
    car_color,
    license_plate,
    is_online: false,
    is_busy: false,
    rating: 5.0,
    total_trips: 0,
    full_name: 'Driver Demo',
    phone: '+995123456789',
    current_location: { lat: 41.7181, lng: 44.8311 }
  };
  
  drivers.set(driverId, driver);
  
  res.json({
    message: 'Driver registered successfully',
    driver
  });
});

app.get('/api/drivers/profile', (req, res) => {
  const driverId = 'driver-1'; // Mock driver ID for demo
  
  const driver = drivers.get(driverId);
  if (!driver) {
    return res.status(404).json({ error: 'Driver profile not found' });
  }
  
  res.json(driver);
});

app.put('/api/drivers/status', (req, res) => {
  const { is_online } = req.body;
  const driverId = 'driver-1'; // Mock driver ID
  
  const driver = drivers.get(driverId);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  
  drivers.set(driverId, {
    ...driver,
    is_online
  });
  
  res.json({
    message: 'Driver status updated',
    driver: { ...driver, is_online }
  });
});

app.post('/api/rides/:rideId/accept', (req, res) => {
  const { rideId } = req.params;
  const driverId = 'driver-1'; // Mock driver ID
  
  const ride = rides.get(rideId);
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  
  if (ride.status !== 'pending') {
    return res.status(403).json({ error: 'This ride is no longer available' });
  }
  
  // Assign ride to this driver
  const updatedRide = {
    ...ride,
    status: 'accepted',
    driver_id: driverId
  };
  
  rides.set(rideId, updatedRide);
  
  // Mark driver as busy
  const driver = drivers.get(driverId);
  if (driver) {
    drivers.set(driverId, {
      ...driver,
      is_busy: true
    });
  }
  
  io.emit('ride-accepted', {
    ride: updatedRide,
    driver: {
      full_name: driver?.full_name,
      phone: driver?.phone,
      car_make: driver?.car_make,
      car_model: driver?.car_model,
      license_plate: driver?.license_plate,
      rating: driver?.rating
    }
  });
  
  res.json({
    message: 'Ride accepted successfully',
    ride: updatedRide
  });
});

app.post('/api/rides/:rideId/start', (req, res) => {
  const { rideId } = req.params;
  const driverId = 'driver-1';
  
  const ride = rides.get(rideId);
  if (!ride || ride.driver_id !== driverId) {
    return res.status(404).json({ error: 'Ride not found or not assigned' });
  }
  
  const updatedRide = {
    ...ride,
    status: 'in_progress',
    started_at: new Date().toISOString()
  };
  
  rides.set(rideId, updatedRide);
  
  io.emit('ride-started', { ride: updatedRide });
  
  res.json({
    message: 'Ride started successfully',
    ride: updatedRide
  });
});

app.post('/api/rides/:rideId/complete', (req, res) => {
  const { rideId } = req.params;
  const driverId = 'driver-1';
  
  const ride = rides.get(rideId);
  if (!ride || ride.driver_id !== driverId) {
    return res.status(404).json({ error: 'Ride not found or not assigned' });
  }
  
  // Mark driver as available again
  const driver = drivers.get(driverId);
  if (driver) {
    drivers.set(driverId, {
      ...driver,
      is_busy: false,
      total_trips: driver.total_trips + 1
    });
  }
  
  const updatedRide = {
    ...ride,
    status: 'completed',
    completed_at: new Date().toISOString()
  };
  
  rides.set(rideId, updatedRide);
  
  io.emit('ride-completed', { ride: updatedRide });
  
  res.json({
    message: 'Ride completed successfully',
    ride: updatedRide
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('driver-location-update', (data) => {
    const driver = drivers.get(data.userId);
    if (driver) {
      drivers.set(data.userId, {
        ...driver,
        current_location: data.location
      });
    }
    socket.to(`ride-${data.rideId}`).emit('location-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Generated ${randomDrivers.length} random drivers`);
});
