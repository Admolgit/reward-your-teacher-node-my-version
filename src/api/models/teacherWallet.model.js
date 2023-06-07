const mongoose = require('mongoose');

const teacherWalletSchema = mongoose.Schema({
  teacherId: {
    type: String,
  },
  walletId: {
    type: String,
  },
  balance: {
    type: Number,
  },
  status: {
    type: String,
  },
},
{ timestamps: true });

const TeacherWallet = mongoose.model('TeacherWallet', teacherWalletSchema);

module.exports = TeacherWallet;
