import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://invoice-generator-fv3n.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection logic
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

// Middleware to ensure DB is connected before handling routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

import authRoutes from '../routes/authRoutes.js';
import invoiceRoutes from '../routes/invoiceRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
  res.send('Invoice Management System API');
});

// Catch-all route for any unhandled paths to confirm Express is reachable
app.use((req, res) => {
  res.status(404).json({
    message: `Path not found on Express: ${req.path}`,
    suggestion: "Check your routes and method (POST/GET)"
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

export default app;
