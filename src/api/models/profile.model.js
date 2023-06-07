const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  yearsOfTeaching: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  schoolType: {
    type: String,
    required: true,
  },
  uploadNIN: {
    type: Buffer,
    // required: true,
    contentType: String,
  },
  teacherId: {
    type: String,
  },
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
