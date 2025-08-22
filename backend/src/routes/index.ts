import { Router } from 'express';

// User routes
export const userRoutes = Router();
userRoutes.get('/', (req, res) => {
  res.json({ message: 'User routes working' });
});

// Room routes
export const roomRoutes = Router();
roomRoutes.get('/', (req, res) => {
  res.json({ message: 'Room routes working' });
});

// Booking routes
export const bookingRoutes = Router();
bookingRoutes.get('/', (req, res) => {
  res.json({ message: 'Booking routes working' });
});
