import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

// Test endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock data storage
const users = new Map();
const drivers = new Map();
const rides = new Map();

// Initialize some test drivers
drivers.set('driver-1', {
  id: 'driver-1',
  user_id: 'driver-1',
  is_online: true,
  is_busy: false,
  current_location: { lat: 41.721, lng: 44.827 }
});

drivers.set('driver-2', {
  id: 'driver-2',
  user_id: 'driver-2', 
  is_online: true,
  is_busy: false,
  current_location: { lat: 41.725, lng: 44.815 }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock driver accounts
  if (email.includes('driver')) {
    const driverId = email.includes('1') ? 'driver-1' : 'driver-2';
    res.json({
      message: 'Login successful (mock)',
      token: 'mock-driver-token',
      user: {
        id: driverId,
        email,
        full_name: `Driver ${email.includes('1') ? '1' : '2'}`,
        phone: '+995123456789',
        role: 'driver',
        balance: 100
      }
    });
    return;
  }
  
  // Mock rider authentication
  res.json({
    message: 'Login successful (mock)',
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
  // Mock registration
  res.json({
    message: 'Registration successful (mock)',
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
  // Mock user profile
  res.json({
    id: 'mock-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+995123456789',
    role: 'rider',
    balance: 50
  });
});

app.post('/api/rides/request', (req, res) => {
  // Mock ride request with driver availability check
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
  
  // Assign ride to first available driver
  const assignedDriver = availableDrivers[0];
  
  // Mark driver as busy
  drivers.set(assignedDriver.id, {
    ...assignedDriver,
    is_busy: true
  });
  
  const ride = {
    id: 'mock-ride-' + Date.now(),
    rider_id: 'mock-user-id',
    driver_id: assignedDriver.id,
    origin,
    destination,
    status: 'pending',
    fare: 15.50,
    distance: 5.2,
    duration: 15,
    payment_method: 'balance',
    payment_status: 'pending',
    created_at: new Date().toISOString()
  };
  
  rides.set(ride.id, ride);
  
  // Notify driver about new ride request
  io.emit('new-ride-request', {
    rideId: ride.id,
    driverId: assignedDriver.id,
    origin,
    destination,
    fare: ride.fare
  });
  
  res.json({
    message: 'Ride request created - waiting for driver acceptance',
    ride
  });
});

// Driver endpoints
app.post('/api/drivers/register', (req, res) => {
  const { license_number, car_make, car_model, car_year, car_color, license_plate } = req.body;
  
  const driver = {
    id: 'driver-' + Date.now(),
    license_number,
    car_make,
    car_model,
    car_year,
    car_color,
    license_plate,
    is_online: false,
    is_busy: false,
    rating: 5.0,
    total_trips: 0
  };
  
  drivers.set(driver.id, driver);
  
  res.json({
    message: 'Driver registered successfully',
    driver
  });
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
  
  if (ride.driver_id !== driverId) {
    return res.status(403).json({ error: 'This ride is not assigned to you' });
  }
  
  // Update ride status
  const updatedRide = {
    ...ride,
    status: 'accepted'
  };
  
  rides.set(rideId, updatedRide);
  
  // Notify rider
  io.emit('ride-accepted', {
    ride: updatedRide,
    driverId
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
