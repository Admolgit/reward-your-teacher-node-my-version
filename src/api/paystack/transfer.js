const _ = require('lodash');
const { apiPost } = require('../utils/utils');

exports.Transfer = async (req, res) => {
  try {
    const form = _.pick(req.body, ['source', 'reason', 'amount', 'recipient']);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    };
    const body = {
      source: form.source,
      reason: form.reason,
      amount: form.amount,
      recipient: form.recipient,
    };
    const response = await apiPost(process.env.PAYSTACK_TRANSFER_URL, headers, body);

    if (response.status !== 200) {
      return res.status(400).json({
        status: 'error',
        message: 'Transfer failed',
        data: response.data,
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Transfer successful',
      data: response.data,
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Transfer failed',
      data: error,
    });
  }
};
