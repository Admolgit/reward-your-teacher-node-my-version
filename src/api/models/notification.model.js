const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const notificationSchema = new mongoose.Schema(
  {
    senderId: {
      type: ObjectId,
      ref: 'Teacher',
    },
    content: String,
    status: {
      type: String,
      enum: ['delivered', 'read'],
      default: 'delivered',
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification };
