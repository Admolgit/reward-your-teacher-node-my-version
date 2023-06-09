const Teacher = require('../models/teacher.model');

module.exports.getTeacherBalance = async (req, res) => {
  try {
    console.log(req.params.id)
    const teacher = await Teacher.findOne({ _id: req.params.id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found', error: true });
    }

    return res.status(200).json({
      balance: teacher.balance,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
};
