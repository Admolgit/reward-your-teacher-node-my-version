// const { Wallet } = require('../models/wallet.model');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
// const TeacherWallet = require('../models/teacherWallet.model');
// const { rewardNotification } = require('../models/rewardNotification.model');

exports.sendReward = async (req, res) => {
  try {
    const { account, amount, senderEmail } = req.body;

    const teacher = await Teacher.findOne({ virtual_account_id: account });

    if (!teacher) {
      return res.status(404).send({ message: 'Teacher not found', error: true });
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

    console.log(student, 'found student');
    console.log(teacher, 'found teacher');

    // Check if user has a wallet
    // const wallets = await Wallet.findOne({
    //   creatorId: student._id,
    // });
    // console.log(wallets, 'wallet found');

    // // If yes, then update the wallet balance
    // if (wallets) {
    //   await Wallet.findOneAndUpdate({ balance: senderNewBalance });
    //   console.log('got here...');
    // } else {
    // // If wallet does not exist, create a new wallet
    //   const wallet = new Wallet({
    //     creatorId: student._id,
    //     balance: senderNewBalance,
    //   });
    //   console.log('got here at creating new wallet');

    //   // Save the wallet
    //   await wallet.save();
    // }
    // console.log(teacher, 'check teacher');

    // // Check if teacher has a wallet
    // const teacherWallets = await TeacherWallet.findOne({
    //   teacherId: teacher._id,
    // });

    // // if (!teacherWallets) {
    // //   res.send({ message: 'Teacher wallet does not exist' });
    // // }
    // console.log(teacherWallets, 'wallet for teacher found...');

    // if (teacherWallets) {
    //   await TeacherWallet.findOneAndUpdate({ balance: receiverNewBalance });
    //   console.log('updating teacher wallet');

    //   // Send notification
    //   const notificationPayload = {
    //     recieverId: teacher._id,
    //     // content: `₦${parseInt(amount)
    //     //   .toFixed(2)
    //     //   .replace(/\d(?=(\d{3})+\.)/g, '$&,')} has been sent to you as a gift from ${
    //     //   student.fullName
    //     // }`,
    //   };
    //   await rewardNotification.create(notificationPayload);
    // } else {
    //   console.log('creating teacher wallet...');
    //   const teacherWallet = new TeacherWallet({
    //     teacherId: teacher._id,
    //     balance: receiverNewBalance,
    //   });

    //   // Save the wallet
    //   await teacherWallet.save();

    //   // Send notification
    //   const notificationPayload = {
    //     recieverId: teacher._id,
    //     // content: `₦${parseInt(amount)
    //     //   .toFixed(2)
    //     //   .replace(/\d(?=(\d{3})+\.)/g, '$&,')} has been sent to you as a gift from ${
    //     //   student.fullName
    //     // }`,
    //   };

    //   await rewardNotification.create(notificationPayload);
    // }

    return res.status(200).json({
      message: 'Reward sent successful',
      error: false,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
};
