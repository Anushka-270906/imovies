import express from 'express';
import { getPaymentConfig, createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
