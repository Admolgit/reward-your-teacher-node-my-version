const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  walletId: {
    type: String,
    unique: false,
  },
  creatorId: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0,
  },
},
{
  timestamps: true,
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = { Wallet };
