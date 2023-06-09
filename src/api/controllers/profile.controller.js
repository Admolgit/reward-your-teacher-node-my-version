const Profile = require('../models/profile.model');
const Teacher = require('../models/teacher.model');

module.exports.saveProfile = async (req, res) => {
  try {
    const {
      name,
      school,
      yearsOfTeaching,
      subject,
      schoolType,
      // uploadNIN,
    } = req.body;

    const teacher = await Teacher.findOne({ _id: req.params.teacherId });

    if (!teacher) {
      return res.status(404).send({
        message: 'Teacher not found',
      });
    }

    const profile = await Profile.findOne({ teacherId: req.params.teacherId });

    if (!profile) {
      await Profile.create({
        name,
        school,
        yearsOfTeaching,
        subject,
        schoolType,
        // uploadNIN,
        teacherId: req.params.teacherId,
      });
    } else {
      await Profile.findOneAndUpdate({ teacherId: req.params.teacherId }, {
        name,
        school,
        yearsOfTeaching,
        subject,
        schoolType,
        // uploadNIN,
        teacherId: req.params.teacherId,
      });
    }

    return res.status(201).json({
      message: 'Profile created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error saving profile',
    });
  }
};
