import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createBooking);
router.route('/my').get(getMyBookings);
router.route('/:id').get(getBookingById);
router.route('/:id/cancel').post(cancelBooking);

export default router;
