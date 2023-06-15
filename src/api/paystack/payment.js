const _ = require('lodash');
const axios = require('axios');
const User = require('../models/user.model');
const { apiPost } = require('../utils/utils');
const { Transaction } = require('../models/transaction.model');
const { Notification } = require('../models/notification.model');

exports.Payment = async (req, res) => {
  try {
    console.log(req.query, 'checking query');
    const { email, amount } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    const form = _.pick(req.query, ['email', 'amount']);

    form.metadata = {
      fullName: user.fullName,
    };

    form.amount *= 100;

    console.log(form, "FORM")

    const response = await apiPost(
      process.env.PAYSTACK_INITIALIZE_PAYMENT_URL,
      JSON.stringify(form),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
      // true
    );

    const transationPayload = {
      userId: user._id,
      amount: Number(amount),
      status: 'pending',
      reference: response.data.data.reference,
      access_code: response.data.data.access_code,
    };

    console.log(transationPayload, "PAYLOAD")

    const savedTransaction = await Transaction.create(transationPayload);
    console.log(savedTransaction, "Saved transaction")
    return res.json({ error: false, url: response.data.data.authorization_url, transaction: savedTransaction});
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

exports.paystackCallback = async (req, res, next) => {
  try {
    const { reference } = req.query;
    const paystackVerifyResponse = await axios.get(`${process.env.PAYSTACK_VERIFY_URL}/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const data = _.at(paystackVerifyResponse.data.data, [
      'status',
      // 'ip_address',
      'reference',
      'currency',
      'channel',
    ]);

    console.log(data, "DATA")

    const [status, currency, channel] = data;

    const transaction = await Transaction.findOne({ reference });
    if (transaction.status === 'success') return res.redirect(`${process.env.FRONT_END_STUDENT_DASHBOARD}/students-dashboard`);

    const { userId } = transaction;
    const user = await User.findOne({ _id: userId });
    // eslint-disable-next-line no-unused-vars

    const saveTxnResp = await Transaction.findOneAndUpdate(
      { userId: user.id, reference },
      {
        $set: { status: "success" },
        // ip_address,
        reference,
        currency,
        channel,
      },
    );

    console.log(saveTxnResp, "TRAN");

    // if (status !== 'success') return res.redirect(`${process.env.FRONT_END_STUDENT_DASHBOARD}/students-dashboard`);
    // const transactionUpdated = await Transaction.findOne({ reference });

    await User.updateOne(
      { _id: user.id },
      { $inc: { balance: +transaction.amount } },
    );

    const notificationPayload = {
      senderId: user.id,
      content: `₦${transaction.amount.toFixed(
        2,
      )} has been deposited into your Wallet!.`,
    };

    const notification = new Notification(notificationPayload);
    await notification.save();
    console.log(`${process.env.FRONT_END_STUDENT_DASHBOARD}/students-dashboard`);
    return res.redirect(`${process.env.FRONT_END_STUDENT_DASHBOARD}/students-dashboard`);
    // res.redirect(`${process.env.FRONT_END_STUDENT_DASHBOARD}/students-dashboard`);
  } catch (error) {
    return next(error);
    // return res.status(500).json({ error: true, message: error.message });
  }
};
