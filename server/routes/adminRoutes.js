import express from 'express';
import {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
} from '../controllers/adminController.js';
import { protect, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorizeAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);

export default router;
