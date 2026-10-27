import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, featured, sort, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    let sortOptions = { releaseDate: -1 };
    if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    } else if (sort === 'releaseDate') {
      sortOptions = { releaseDate: -1 };
    } else if (sort === 'popular') {
      sortOptions = { rating: -1, isFeatured: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query).sort(sortOptions).skip(skip).limit(Number(limit));

    // Get unique genres & languages for filter dropdowns
    const allGenres = await Movie.distinct('genre');
    const allLanguages = await Movie.distinct('language');

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      availableGenres: allGenres,
      availableLanguages: allLanguages,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie with upcoming shows and theaters
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Fetch shows for this movie populated with theater details
    const shows = await Show.find({ movie: movie._id, isActive: true })
      .populate('theater', 'name location screenName balconyPrice middlePrice regularPrice')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      data: movie,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      releaseDate,
      duration,
      certification,
      language,
      rating,
      posterUrl,
      backdropUrl,
      trailerUrl,
      isFeatured,
      isTrending,
      isUpcoming,
      director,
      cast,
      status,
    } = req.body;

    // Parse genres if provided as comma-separated string
    const genreArray = Array.isArray(genre)
      ? genre
      : typeof genre === 'string'
      ? genre.split(',').map((g) => g.trim()).filter(Boolean)
      : ['Action'];

    // Parse cast if provided as comma-separated string
    const castArray = Array.isArray(cast)
      ? cast
      : typeof cast === 'string'
      ? cast.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    const movie = await Movie.create({
      title,
      description,
      genre: genreArray,
      releaseDate: releaseDate || new Date(),
      duration: Number(duration) || 120,
      certification: certification || 'PG-13',
      language: language || 'English',
      rating: Number(rating) || 8.0,
      posterUrl,
      backdropUrl: backdropUrl || posterUrl,
      trailerUrl: trailerUrl || '',
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isUpcoming: Boolean(isUpcoming),
      director: director || '',
      cast: castArray,
      status: status || 'Now Showing',
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const updates = { ...req.body };
    if (updates.genre && typeof updates.genre === 'string') {
      updates.genre = updates.genre.split(',').map((g) => g.trim()).filter(Boolean);
    }
    if (updates.cast && typeof updates.cast === 'string') {
      updates.cast = updates.cast.split(',').map((c) => c.trim()).filter(Boolean);
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Check for active future bookings
    const activeBookings = await Booking.countDocuments({
      movie: movie._id,
      bookingStatus: 'Confirmed',
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete movie. There are ${activeBookings} active booking(s) associated with it. Consider changing status to 'Ended' instead.`,
      });
    }

    // Remove associated shows
    await Show.deleteMany({ movie: movie._id });
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Movie and its shows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
