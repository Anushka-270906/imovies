import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Booking from '../models/Booking.js';

// Helper to remove expired locks from a show
const cleanExpiredLocks = (show) => {
  const now = new Date();
  if (show.lockedSeats && show.lockedSeats.length > 0) {
    show.lockedSeats = show.lockedSeats.filter((lock) => new Date(lock.expiresAt) > now);
  }
};

// @desc    Get all shows with optional filters
// @route   GET /api/shows
// @access  Public
export const getShows = async (req, res, next) => {
  try {
    const { movie, theater, date, activeOnly } = req.query;

    const query = {};
    if (movie) query.movie = movie;
    if (theater) query.theater = theater;
    if (date) query.showDate = date;
    if (activeOnly === 'true') query.isActive = true;

    const shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration rating certification language')
      .populate('theater', 'name location screenName balconyPrice middlePrice regularPrice balconySeats middleSeats regularSeats')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show by ID (with seat availability & layout)
// @route   GET /api/shows/:id
// @access  Public
export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theater');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    cleanExpiredLocks(show);
    await show.save();

    res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create show
// @route   POST /api/shows
// @access  Private/Admin
export const createShow = async (req, res, next) => {
  try {
    const { movie, theater, showDate, showTime, screenName, balconyPrice, middlePrice, regularPrice } = req.body;

    if (!movie || !theater || !showDate || !showTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, theater, date, and show time',
      });
    }

    const movieObj = await Movie.findById(movie);
    if (!movieObj) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const theaterObj = await Theater.findById(theater);
    if (!theaterObj) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    // Check duplicate show at same theater on same date and time
    const existing = await Show.findOne({
      theater,
      showDate,
      showTime,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A show is already scheduled at this theater on ${showDate} at ${showTime}.`,
      });
    }

    const show = await Show.create({
      movie,
      theater,
      showDate,
      showTime,
      screenName: screenName || theaterObj.screenName || 'Screen 1',
      balconyPrice: balconyPrice !== undefined ? Number(balconyPrice) : theaterObj.balconyPrice,
      middlePrice: middlePrice !== undefined ? Number(middlePrice) : theaterObj.middlePrice,
      regularPrice: regularPrice !== undefined ? Number(regularPrice) : theaterObj.regularPrice,
      bookedSeats: [],
      lockedSeats: [],
      isActive: true,
    });

    const populated = await Show.findById(show._id).populate('movie').populate('theater');

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private/Admin
export const updateShow = async (req, res, next) => {
  try {
    let show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // If changing time or date, make sure no active bookings exist
    if (
      (req.body.showDate && req.body.showDate !== show.showDate) ||
      (req.body.showTime && req.body.showTime !== show.showTime)
    ) {
      const bookingsCount = await Booking.countDocuments({
        show: show._id,
        bookingStatus: 'Confirmed',
      });
      if (bookingsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot change date/time of a show with ${bookingsCount} confirmed booking(s).`,
        });
      }
    }

    show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('movie').populate('theater');

    res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const bookingsCount = await Booking.countDocuments({
      show: show._id,
      bookingStatus: 'Confirmed',
    });

    if (bookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete show. It has ${bookingsCount} confirmed booking(s).`,
      });
    }

    await Show.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lock seats temporarily (10 min expiry)
// @route   POST /api/shows/:id/lock
// @access  Private
export const lockSeats = async (req, res, next) => {
  try {
    const { seats } = req.body; // Array of seat IDs: ["B-A1", "B-A2"]
    const userId = req.user.id;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'No seats provided' });
    }

    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    cleanExpiredLocks(show);

    // Check if any seat is already booked
    const alreadyBooked = seats.filter((s) => show.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${alreadyBooked.join(', ')} are already booked.`,
      });
    }

    // Check if any seat is locked by someone else
    const lockedByOthers = show.lockedSeats.filter(
      (l) => seats.includes(l.seatId) && l.userId.toString() !== userId
    );
    if (lockedByOthers.length > 0) {
      const lockedIds = lockedByOthers.map((l) => l.seatId);
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${lockedIds.join(', ')} are currently selected by another user.`,
      });
    }

    // Remove user's previous locks for this show
    show.lockedSeats = show.lockedSeats.filter((l) => l.userId.toString() !== userId);

    // Add new locks (10 min expiry)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    seats.forEach((seatId) => {
      show.lockedSeats.push({ seatId, userId, expiresAt });
    });

    await show.save();

    // Broadcast if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit(`seat-update-${show._id}`, {
        bookedSeats: show.bookedSeats,
        lockedSeats: show.lockedSeats.map((l) => l.seatId),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seats locked temporarily',
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};
