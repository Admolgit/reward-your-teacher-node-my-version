const mongoose = require('mongoose');

const googleSchema = new mongoose.Schema({
  google: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Google', googleSchema);
