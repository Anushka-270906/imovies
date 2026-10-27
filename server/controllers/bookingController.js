import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Payment from '../models/Payment.js';

// Helper to generate reference ID
const generateReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IMV-${timestamp}-${random}`;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { showId, seats, paymentMethod = 'DEMO_PAYMENT' } = req.body;
    const userId = req.user.id;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showId and an array of selected seats.',
      });
    }

    const show = await Show.findById(showId).populate('movie').populate('theater');
    if (!show || !show.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Show not found or is currently inactive.',
      });
    }

    const seatIds = seats.map((s) => (typeof s === 'string' ? s : s.seatId));

    // Concurrency protection: Atomic database update
    // Update show only if none of the seatIds are already booked!
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seatIds },
      },
      {
        $push: { bookedSeats: { $each: seatIds } },
        $pull: { lockedSeats: { seatId: { $in: seatIds } } },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        success: false,
        message: 'One or more of the selected seats were just booked by another user. Please choose different seats.',
      });
    }

    // Calculate itemized seat prices based on category
    let subtotal = 0;
    const seatDetails = seatIds.map((seatId) => {
      let category = 'Regular';
      let price = show.regularPrice;

      if (seatId.startsWith('B-') || seatId.startsWith('BAL-')) {
        category = 'Balcony';
        price = show.balconyPrice;
      } else if (seatId.startsWith('M-') || seatId.startsWith('MID-')) {
        category = 'Middle';
        price = show.middlePrice;
      }

      subtotal += price;
      return {
        seatId,
        category,
        price,
      };
    });

    const taxAndFees = Math.round(subtotal * 0.05 * 100) / 100; // 5% service tax / booking fee
    const totalAmount = Math.round((subtotal + taxAndFees) * 100) / 100;

    const bookingReference = generateReference();

    // Create booking record
    const booking = await Booking.create({
      bookingReference,
      user: userId,
      movie: show.movie._id,
      theater: show.theater._id,
      show: show._id,
      showDate: show.showDate,
      showTime: show.showTime,
      seats: seatDetails,
      seatCount: seatDetails.length,
      subtotal,
      taxAndFees,
      totalAmount,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod,
      paymentTransactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    });

    // Create payment ledger entry
    await Payment.create({
      orderId: bookingReference,
      user: userId,
      booking: booking._id,
      amount: totalAmount,
      currency: 'USD',
      provider: paymentMethod === 'DEMO_PAYMENT' ? 'DEMO' : 'STRIPE',
      status: 'COMPLETED',
      paymentMethod,
      transactionId: booking.paymentTransactionId,
    });

    // Broadcast seat availability update via Socket.IO
    if (req.app.get('io')) {
      req.app.get('io').emit(`seat-update-${show._id}`, {
        bookedSeats: updatedShow.bookedSeats,
        lockedSeats: updatedShow.lockedSeats ? updatedShow.lockedSeats.map((l) => l.seatId) : [],
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theater')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie')
      .populate('theater')
      .populate('show')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theater')
      .populate('show')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure ownership or admin privilege
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.',
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    // Release seats in the Show record
    const seatIds = booking.seats.map((s) => s.seatId);
    const updatedShow = await Show.findByIdAndUpdate(
      booking.show,
      { $pull: { bookedSeats: { $in: seatIds } } },
      { new: true }
    );

    // Update booking status
    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    booking.cancellationDate = new Date();
    await booking.save();

    // Broadcast seat availability update via Socket.IO
    if (req.app.get('io') && updatedShow) {
      req.app.get('io').emit(`seat-update-${updatedShow._id}`, {
        bookedSeats: updatedShow.bookedSeats,
        lockedSeats: updatedShow.lockedSeats ? updatedShow.lockedSeats.map((l) => l.seatId) : [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been made available.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
