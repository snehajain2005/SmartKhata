const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/settings
router.get('/', async (req, res) => {
  res.json({ success: true, data: req.user.settings });
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const { language, reminderTemplate } = req.body;
    const update = {};
    if (language) update['settings.language'] = language;
    if (reminderTemplate) update['settings.reminderTemplate'] = reminderTemplate;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select('-password');
    res.json({ success: true, data: user.settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
