import Favorite from '../models/Favorite.js';
import Movie from '../models/Movie.js';

// @desc    Get user's favorite movies
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate('movie');
    const movies = favorites
      .filter((fav) => fav.movie !== null)
      .map((fav) => fav.movie);

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to favorites
// @route   POST /api/favorites/:movieId
// @access  Private
export const addFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const existing = await Favorite.findOne({ user: req.user.id, movie: movieId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Movie is already in your favorites',
      });
    }

    await Favorite.create({
      user: req.user.id,
      movie: movieId,
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/favorites/:movieId
// @access  Private
export const removeFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    await Favorite.findOneAndDelete({ user: req.user.id, movie: movieId });

    res.status(200).json({
      success: true,
      message: 'Movie removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};
