import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';

// @desc    Get Admin Dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalTheaters,
      totalShows,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueResult,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments(),
      Theater.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'Confirmed' }),
      Booking.countDocuments({ bookingStatus: 'Cancelled' }),
      Booking.aggregate([
        { $match: { bookingStatus: 'Confirmed', paymentStatus: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
      Booking.find()
        .populate('user', 'name email')
        .populate('movie', 'title posterUrl')
        .populate('theater', 'name location')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue = revenueResult.length > 0 ? Math.round(revenueResult[0].totalRevenue * 100) / 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheaters,
        totalShows,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with filtering & search
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('movie', 'title posterUrl')
      .populate('theater', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Compute user booking counts
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookingsCount = await Booking.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          bookingsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};
