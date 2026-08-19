import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { initSockets } from './sockets/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    name: 'CineBook API Server',
    version: '1.0.0',
  });
});

// API Routes (Mounted on both /api and /api/v1)
app.use('/api', routes);
app.use('/api/v1', routes);

// 404 & Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Socket Handlers
initSockets(io);

// Start Server
const startServer = async () => {
  await connectDB();

  server.listen(ENV.PORT, () => {
    console.log(`=========================================`);
    console.log(`🎬 CineBook API Server running on port ${ENV.PORT}`);
    console.log(`🚀 Environment: ${ENV.NODE_ENV}`);
    console.log(`📡 Socket.IO Realtime gateway active`);
    console.log(`🔗 API Base: http://localhost:${ENV.PORT}/api`);
    console.log(`🔗 Debug Endpoint: http://localhost:${ENV.PORT}/api/debug/tmdb-now-playing`);
    console.log(`=========================================`);
  });
};

startServer();

export { app, server, io };
