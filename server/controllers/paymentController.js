import Payment from '../models/Payment.js';

// @desc    Get payment configuration details for client
// @route   GET /api/payments/config
// @access  Public
export const getPaymentConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    mode: process.env.PAYMENT_MODE || 'DEMO',
    currency: 'USD',
    isDemo: true,
    notice: 'DEMO PAYMENT SIMULATOR ENABLED: No real financial transaction will occur.',
  });
};

// @desc    Create payment order (for genuine gateway or demo simulation)
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'USD', showId, seats } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const payment = await Payment.create({
      orderId,
      user: userId,
      amount,
      currency,
      provider: process.env.PAYMENT_MODE === 'LIVE' ? 'STRIPE' : 'DEMO',
      status: 'CREATED',
    });

    res.status(201).json({
      success: true,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, transactionId, paymentMethod = 'Demo Card' } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment order not found' });
    }

    payment.status = 'COMPLETED';
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId || `TXN-DEMO-${Date.now()}`;
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully (Demo Mode)',
      payment,
    });
  } catch (error) {
    next(error);
  }
};
