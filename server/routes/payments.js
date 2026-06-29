const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../services/razorpay');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/payments/order
// Creates a Razorpay order for a customer payment
router.post('/order', async (req, res) => {
  try {
    const { customerId, amount } = req.body;

    if (!customerId || !amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid customerId and amount are required' });
    }

    // Verify customer belongs to this user
    const customer = await Customer.findOne({ _id: customerId, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${customerId}_${Date.now()}`,
      notes: {
        customerId: customerId.toString(),
        customerName: customer.name,
        userId: req.user._id.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        customerName: customer.name,
        customerPhone: customer.phone,
      },
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create payment order' });
  }
});

// POST /api/payments/verify
// Verifies Razorpay payment signature and records the transaction
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerId,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification data missing' });
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // Verify customer belongs to this user
    const customer = await Customer.findOne({ _id: customerId, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Record the payment transaction
    const txn = await Transaction.create({
      customerId,
      userId: req.user._id,
      type: 'payment',
      amount: Number(amount),
      items: `Payment via Razorpay`,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentMethod: 'razorpay',
    });

    // Return updated balance
    const allTxns = await Transaction.find({ customerId, userId: req.user._id });
    const totalCredit = allTxns.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalPayment = allTxns.filter((t) => t.type === 'payment').reduce((s, t) => s + t.amount, 0);
    const balance = totalCredit - totalPayment;

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      data: {
        transaction: txn,
        balance,
      },
    });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
  }
});

module.exports = router;
