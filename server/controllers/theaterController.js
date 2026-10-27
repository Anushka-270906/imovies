import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
export const getTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: theaters.length,
      data: theaters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theater
// @route   GET /api/theaters/:id
// @access  Public
export const getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    res.status(200).json({
      success: true,
      data: theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theater
// @route   POST /api/theaters
// @access  Private/Admin
export const createTheater = async (req, res, next) => {
  try {
    const {
      name,
      location,
      screenName,
      balconyPrice,
      balconySeats,
      middlePrice,
      middleSeats,
      regularPrice,
      regularSeats,
      isActive,
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Theater name and location are required',
      });
    }

    if (
      balconySeats <= 0 ||
      middleSeats <= 0 ||
      regularSeats <= 0 ||
      balconyPrice < 0 ||
      middlePrice < 0 ||
      regularPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'All seat counts must be greater than zero, and prices cannot be negative.',
      });
    }

    const theater = await Theater.create({
      name: name.trim(),
      location: location.trim(),
      screenName: screenName || 'Screen 1 (Dolby 7.1 Atmos)',
      balconyPrice: Number(balconyPrice),
      balconySeats: Number(balconySeats),
      middlePrice: Number(middlePrice),
      middleSeats: Number(middleSeats),
      regularPrice: Number(regularPrice),
      regularSeats: Number(regularSeats),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Theater created successfully',
      data: theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theater
// @route   PUT /api/theaters/:id
// @access  Private/Admin
export const updateTheater = async (req, res, next) => {
  try {
    let theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Theater updated successfully',
      data: theater,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theater
// @route   DELETE /api/theaters/:id
// @access  Private/Admin
export const deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      theater: theater._id,
      bookingStatus: 'Confirmed',
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete theater with ${activeBookings} active booking(s). Deactivate it instead.`,
      });
    }

    await Show.deleteMany({ theater: theater._id });
    await Theater.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Theater and its scheduled shows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
