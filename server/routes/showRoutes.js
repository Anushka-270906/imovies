import express from 'express';
import {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  lockSeats,
} from '../controllers/showController.js';
import { protect, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getShows).post(protect, authorizeAdmin, createShow);
router
  .route('/:id')
  .get(getShowById)
  .put(protect, authorizeAdmin, updateShow)
  .delete(protect, authorizeAdmin, deleteShow);

router.post('/:id/lock', protect, lockSeats);

export default router;
