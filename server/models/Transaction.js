const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'payment'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    items: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

transactionSchema.index({ customerId: 1, userId: 1 });
transactionSchema.index({ userId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
