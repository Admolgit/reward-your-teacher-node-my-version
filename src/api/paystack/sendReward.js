const { Wallet } = require('../models/wallet.model');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const TeacherWallet = require('../models/teacherWallet.model');
const { rewardNotification } = require('../models/rewardNotification.model');
const { Notification } = require('../models/notification.model');

exports.sendReward = async (req, res) => {
  try {
    const { account, amount, senderEmail } = req.body;

    const teacher = await Teacher.findOne({ virtual_account_id: account });

    if (!teacher) {
      return res
        .status(404)
        .send({ message: 'Teacher not found', error: true });
    }

    const student = await User.findOne({ email: senderEmail });

    if (!student) {
      return res.status(404).send({ message: 'Sender not found', error: true });
    }

    const doesTheSenderHaveEnoughMoney = student.balance >= Number(amount);

    if (!doesTheSenderHaveEnoughMoney) {
      return res
        .status(400)
        .send({ message: 'Insufficient balance.', error: true });
    }

    // update the student balance
    const senderNewBalance = student.balance - Number(amount);

    await User.findOneAndUpdate(
      { email: senderEmail },
      { balance: senderNewBalance },
    );

    // find user with email address

    // update the receiver balance
    const receiverNewBalance = teacher.balance + Number(amount);

    await Teacher.findOneAndUpdate(
      { virtual_account_id: account },
      { balance: receiverNewBalance },
    );

    // Check if user has a wallet
    const wallets = await Wallet.findOne({
      creatorId: student._id,
    });

    // If yes, then update the wallet balance
    if (wallets) {
      await Wallet.findOneAndUpdate({ balance: senderNewBalance });
    } else {
      // If wallet does not exist, create a new wallet
      const wallet = new Wallet({
        creatorId: student._id,
        balance: senderNewBalance,
      });

      // Save the wallet
      await wallet.save();
    }
    console.log(teacher, 'check teacher');

    // Check if teacher has a wallet
    const teacherWallets = await TeacherWallet.findOne({
      teacherId: teacher._id,
    });

    if (teacherWallets) {
      await TeacherWallet.findOneAndUpdate({ balance: receiverNewBalance });
    } else {
      const newTeacherWallet = new TeacherWallet({
        teacherId: teacher._id,
        balance: receiverNewBalance,
      });

      await newTeacherWallet.save();
    }

    if (teacherWallets) {
      await TeacherWallet.findOneAndUpdate({ balance: receiverNewBalance });

      // Send notification to teacher
      const notificationPayload = {
        recieverId: teacher._id,
        content: `₦${parseInt(amount)
          .toFixed(2)
          .replace(
            /\d(?=(\d{3})+\.)/g,
            '$&,',
          )} has been sent to you as a gift from ${student.fullName}`,
      };

      await rewardNotification.create(notificationPayload);

      // Send notification to student
      const studentNotificationPayload = {
        senderId: student._id,
        content: `You funded ${teacher.fullName} with ${parseInt(amount)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
      };

      await Notification.create(studentNotificationPayload)
    } else {
      const teacherWallet = new TeacherWallet({
        teacherId: teacher._id,
        balance: receiverNewBalance,
      });

      // Save the wallet
      await teacherWallet.save();

      // Send notification to teacher
      const notificationPayload = {
        recieverId: teacher._id,
        content: `₦${parseInt(amount)
          .toFixed(2)
          .replace(
            /\d(?=(\d{3})+\.)/g,
            '$&,',
          )} has been sent to you as a gift from ${student.fullName}`,
      };

      await rewardNotification.create(notificationPayload);

      // Send the notification to the student
      const studentNotificationPayload = {
        senderId: student._id,
        content: `You funded ${teacher.fullName} with ${parseInt(amount)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
      };

      await Notification.create(studentNotificationPayload)
    }
    
    // Send data to the client
    return res.status(200).json({
      message: 'Reward sent successful',
      error: false,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
};
