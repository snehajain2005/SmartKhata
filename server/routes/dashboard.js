const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    const [summary] = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalUdhaar: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
          totalRecovered: { $sum: { $cond: [{ $eq: ['$type', 'payment'] }, '$amount', 0] } },
        },
      },
    ]);

    const totalUdhaar = summary?.totalUdhaar || 0;
    const totalRecovered = summary?.totalRecovered || 0;
    const pendingAmount = totalUdhaar - totalRecovered;

    // Recent transactions with customer name
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerId', 'name phone');

    const totalCustomers = await Customer.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        totalUdhaar,
        totalRecovered,
        pendingAmount,
        totalCustomers,
        recentTransactions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
