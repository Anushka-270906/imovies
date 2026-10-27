import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// One favorite per movie per user
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
