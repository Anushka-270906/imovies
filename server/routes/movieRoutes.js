import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { protect, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getMovies).post(protect, authorizeAdmin, createMovie);
router
  .route('/:id')
  .get(getMovieById)
  .put(protect, authorizeAdmin, updateMovie)
  .delete(protect, authorizeAdmin, deleteMovie);

export default router;
