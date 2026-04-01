import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import shipmentRoutes from './routes/shipments.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Middleware
app.use(cors({
  origin: '*',
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production' || true) {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  // Catch all route for client-side routing
  app.get('*', (req, res, next) => {
    // If it starts with /api, pass it to next (which might handle it if we missed an API route)
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join:shipment', (trackingId) => {
    socket.join(`shipment:${trackingId}`);
    console.log(`📦 Client ${socket.id} watching shipment ${trackingId}`);
  });

  socket.on('leave:shipment', (trackingId) => {
    socket.leave(`shipment:${trackingId}`);
  });

  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`👤 User Room Joined: user:${userId}`);
  });

  socket.on('join:role', (role) => {
    socket.join(`role:${role}`);
    console.log(`🛠️ Role Room Joined: role:${role}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 6000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipment-tracker';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

export default app;
