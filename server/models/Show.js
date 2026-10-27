import mongoose from 'mongoose';

const lockedSeatSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
});

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater reference is required'],
    },
    showDate: {
      type: String, // Stored as YYYY-MM-DD for precise querying and comparison
      required: [true, 'Show date is required'],
    },
    showTime: {
      type: String, // e.g. "10:30 AM", "02:15 PM", "06:30 PM", "09:45 PM"
      required: [true, 'Show time is required'],
    },
    screenName: {
      type: String,
      default: 'Screen 1',
    },
    // Show specific prices (default to theater prices if omitted)
    balconyPrice: {
      type: Number,
      required: true,
    },
    middlePrice: {
      type: Number,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    // Array of seat codes that are already permanently booked
    bookedSeats: {
      type: [String],
      default: [],
    },
    // Temporary seat locks with expiry for live seat reservation
    lockedSeats: [lockedSeatSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of shows per movie/theater/date/time
showSchema.index({ theater: 1, showDate: 1, showTime: 1 });
showSchema.index({ movie: 1, showDate: 1 });

export default mongoose.model('Show', showSchema);
