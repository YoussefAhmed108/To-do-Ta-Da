import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { startReminderService } from './utils/reminderService';

// Load env vars
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import columnRoutes from './routes/columnRoutes';
import taskRoutes from './routes/taskRoutes';
import eventRoutes from './routes/eventRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app: Application = express();

// Middleware
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL || ''
].filter((origin) => origin !== ''); // Remove empty strings

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Start reminder service
startReminderService();

// Test Routes
app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Test route is working'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
