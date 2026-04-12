import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = 3010;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Mock database
const users = new Map();
const drivers = new Map();
const rides = new Map();

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    
    if (!email || !password || !full_name || !phone || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['rider', 'driver'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      full_name,
      phone,
      role,
      balance: 0,
      created_at: new Date().toISOString()
    };

    users.set(userId, user);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = Array.from(users.values()).find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
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

// Driver routes
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

// Ride routes
app.post('/api/rides/request', (req, res) => {
  const { origin, destination } = req.body;
  
  const ride = {
    id: 'ride-' + Date.now(),
    rider_id: 'mock-user-id',
    driver_id: null,
    origin,
    destination,
    status: 'pending',
    fare: 15.50 + Math.random() * 10,
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
    distance: ride.distance * 1000
  });
  
  res.json({
    message: 'Ride request created - waiting for driver',
    ride
  });
});

app.post('/api/rides/:rideId/accept', (req, res) => {
  const { rideId } = req.params;
  const driverId = 'driver-1';
  
  const ride = rides.get(rideId);
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  
  if (ride.status !== 'pending') {
    return res.status(403).json({ error: 'This ride is no longer available' });
  }
  
  const updatedRide = {
    ...ride,
    status: 'accepted',
    driver_id: driverId
  };
  
  rides.set(rideId, updatedRide);
  
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

app.get('/api/users/profile', authenticateToken, (req, res) => {
  // Get user from JWT token
  const user = users.get(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    balance: user.balance
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('driver-location-update', (data) => {
    socket.to(`ride-${data.rideId}`).emit('location-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log('Using in-memory database - no Supabase connection required');
});
