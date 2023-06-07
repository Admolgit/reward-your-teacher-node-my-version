const { Transaction } = require('../models/transaction.model');
const User = require('../models/user.model');

// Get total money sent
exports.getTotalMoneySent = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(400).json({ message: 'User not found', error: true });
    }

    const transactions = await Transaction.find({ userId: req.params.id });

    if (!transactions) {
      return res.status(400).json({ message: 'No transactions found', error: true });
    }

    let total = 0;

    transactions.forEach((transaction) => {
      
      if (transaction.status === 'success') {
        total += transaction.amount;
      }
    });
    if (total === 0) {
      total = 0;
    } else {
      total -= user.balance;
    }

    return res.status(200).json({
      total: total,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
};
