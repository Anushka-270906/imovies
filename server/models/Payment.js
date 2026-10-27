import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    provider: {
      type: String,
      enum: ['DEMO', 'RAZORPAY', 'STRIPE'],
      default: 'DEMO',
    },
    status: {
      type: String,
      enum: ['CREATED', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
    },
    paymentMethod: {
      type: String, // 'Demo Card', 'UPI', 'NetBanking', 'Credit Card'
      default: 'Demo Card',
    },
    transactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', paymentSchema);
