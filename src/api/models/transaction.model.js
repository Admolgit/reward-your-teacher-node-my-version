const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'Users',
  },
  amount: Number,
  reference: String,
  currency: String,
  channel: String,
  ip_address: String,
  status: {
    type: String,
    enum: ['pending', 'success', 'error'],
    default: 'pending',
  },
  access_code: String,
},
{ timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };
