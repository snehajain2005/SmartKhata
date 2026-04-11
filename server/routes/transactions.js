const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/transactions
router.post(
  '/',
  [
    body('customerId').notEmpty().withMessage('Customer ID is required'),
    body('type').isIn(['credit', 'payment']).withMessage('Type must be credit or payment'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      // Verify customer belongs to user
      const customer = await Customer.findOne({ _id: req.body.customerId, userId: req.user._id });
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

      const txn = await Transaction.create({
        customerId: req.body.customerId,
        userId: req.user._id,
        type: req.body.type,
        amount: req.body.amount,
        items: req.body.items || '',
      });

      // Return updated balance
      const allTxns = await Transaction.find({ customerId: customer._id, userId: req.user._id });
      const totalCredit = allTxns.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const totalPayment = allTxns.filter((t) => t.type === 'payment').reduce((s, t) => s + t.amount, 0);

      res.status(201).json({
        success: true,
        data: txn,
        balance: totalCredit - totalPayment,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
