const mongoose = require('mongoose');

// const { ObjectId } = mongoose.Schema.Types;

const notificationSchema = new mongoose.Schema(
  {
    recieverId: String,
    content: String,
    status: {
      type: String,
      enum: ['claim', 'unclaim'],
      default: 'unclaim',
    },
  },
  { timestamps: true },
);

const rewardNotification = mongoose.model('RewardNotification', notificationSchema);

module.exports = { rewardNotification };
