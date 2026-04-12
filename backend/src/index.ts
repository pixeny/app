import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import driverRoutes from './routes/drivers';
import rideRoutes from './routes/rides';
import paymentRoutes from './routes/payments';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3011;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5174",
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/drivers', authenticateToken, driverRoutes);
app.use('/api/rides', authenticateToken, rideRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);

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

  socket.on('ride-status-update', (data) => {
    socket.to(`ride-${data.rideId}`).emit('status-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
