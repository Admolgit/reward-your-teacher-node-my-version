const RewardNotification = require('../models/rewardNotification.model');
const Notification = require('../models/notification.model')

module.exports.getNotifications = async (req, res) => {
  try {
    const { recieverId } = req.params;

    const Notification = await RewardNotification.rewardNotification.find({
      recieverId: recieverId,
    });

    if(!Notification) {
      throw new Error(`Teacher ${recieverId} does not exist`);
    }

    return res.status(200).json({
      message: 'Teacher notifications fetched',
      notification: Notification
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong fetching notifications',
      error: error.message,
    });
  }
};

module.exports.getStudentNotifications = async (req, res) => {
  try {
    const { senderId } = req.params;

    const Notifications = await Notification.Notification.find({
      senderId: senderId,
    });

    if(!Notifications) {
      throw new Error(`Student ${senderId} does not exist`);
    }

    return res.status(200).json({
      message: 'Student notifications fetched',
      notification: Notifications
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong fetching notifications',
      error: error.message,
    });
  }
};
