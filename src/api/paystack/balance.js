const User = require('../models/user.model');

exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found', error: true });
    }

    return res.status(200).json({
      balance: user.balance,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
};
