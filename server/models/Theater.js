import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Theater location/city is required'],
      trim: true,
    },
    screenName: {
      type: String,
      default: 'Screen 1 (Dolby 7.1 Atmos)',
    },
    // Seat categories and pricing
    balconyPrice: {
      type: Number,
      required: [true, 'Balcony seat price is required'],
      min: [0, 'Price cannot be negative'],
    },
    balconySeats: {
      type: Number,
      required: [true, 'Balcony seat count is required'],
      min: [0, 'Seat count cannot be negative'],
      default: 20,
    },
    middlePrice: {
      type: Number,
      required: [true, 'Middle seat price is required'],
      min: [0, 'Price cannot be negative'],
    },
    middleSeats: {
      type: Number,
      required: [true, 'Middle seat count is required'],
      min: [0, 'Seat count cannot be negative'],
      default: 30,
    },
    regularPrice: {
      type: Number,
      required: [true, 'Lower/regular seat price is required'],
      min: [0, 'Price cannot be negative'],
    },
    regularSeats: {
      type: Number,
      required: [true, 'Lower/regular seat count is required'],
      min: [0, 'Seat count cannot be negative'],
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

theaterSchema.virtual('totalSeats').get(function () {
  return (this.balconySeats || 0) + (this.middleSeats || 0) + (this.regularSeats || 0);
});

export default mongoose.model('Theater', theaterSchema);
