import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    certification: {
      type: String,
      default: 'PG-13',
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isUpcoming: {
      type: Boolean,
      default: false,
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Now Showing', 'Upcoming', 'Ended'],
      default: 'Now Showing',
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ language: 1 });
movieSchema.index({ isFeatured: 1, status: 1 });

export default mongoose.model('Movie', movieSchema);
