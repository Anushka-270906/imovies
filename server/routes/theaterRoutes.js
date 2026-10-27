import express from 'express';
import {
  getTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
} from '../controllers/theaterController.js';
import { protect, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getTheaters).post(protect, authorizeAdmin, createTheater);
router
  .route('/:id')
  .get(getTheaterById)
  .put(protect, authorizeAdmin, updateTheater)
  .delete(protect, authorizeAdmin, deleteTheater);

export default router;
