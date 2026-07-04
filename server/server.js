import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import userRoutes from './routes/userRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import billRoutes from './routes/billRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['1.1.1.1', '8.8.8.8']);

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://your-frontend-url.vercel.app",
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Restaurant Management API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenditure', expenditureRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bills', billRoutes);

app.use((err, req, res, next) => {
  if (err.message === 'Only image files are allowed.') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size must be under 5MB.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong.' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Close the other server process and try again.`);
        console.error('Windows: run "netstat -ano | findstr :5000" then "taskkill /PID <pid> /F"');
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
