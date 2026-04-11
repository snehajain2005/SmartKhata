const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user._id }).sort({ name: 1 });

    // Get balances for all customers
    const customerIds = customers.map((c) => c._id);
    const txns = await Transaction.aggregate([
      { $match: { userId: req.user._id, customerId: { $in: customerIds } } },
      {
        $group: {
          _id: '$customerId',
          totalCredit: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
          totalPayment: { $sum: { $cond: [{ $eq: ['$type', 'payment'] }, '$amount', 0] } },
        },
      },
    ]);

    const balanceMap = {};
    txns.forEach((t) => {
      balanceMap[t._id.toString()] = t.totalCredit - t.totalPayment;
    });

    const enriched = customers.map((c) => ({
      ...c.toObject(),
      balance: balanceMap[c._id.toString()] || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customers
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const customer = await Customer.create({ ...req.body, userId: req.user._id });
      res.status(201).json({ success: true, data: customer });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const txns = await Transaction.find({ customerId: customer._id, userId: req.user._id }).sort({ createdAt: -1 });
    const totalCredit = txns.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalPayment = txns.filter((t) => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        customer: { ...customer.toObject(), balance: totalCredit - totalPayment },
        transactions: txns,
        summary: { totalCredit, totalPayment, balance: totalCredit - totalPayment },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/customers/:id
router.put(
  '/:id',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { name: req.body.name, phone: req.body.phone },
        { new: true, runValidators: true }
      );
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      res.json({ success: true, data: customer });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    await Transaction.deleteMany({ customerId: req.params.id });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
