const httpStatus = require('http-status');
const { omit } = require('lodash');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const { Transaction } = require('../models/transaction.model');
// const { Reward } = require('../models/reward.model');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = (req, res) => res.json(req.user.transform());

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Create new user via google
 * @public
 */
exports.createGoogleUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { user } = req.locals;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.updateOne(newUserObject, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
  const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
  const updatedUser = omit(req.body, ommitRole);
  const user = Object.assign(req.locals.user, updatedUser);

  user
    .save()
    .then((savedUser) => res.json(savedUser.transform()))
    .catch((e) => next(User.checkDuplicateEmail(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    const transformedUsers = users.map((user) => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Teacher list
 * @public
 */
exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.list(req.query);
    const transformedTeachers = teachers.map((user) => user.transform());
    return res.json(transformedTeachers);
  } catch (error) {
    return next(error);
  }
};

// eslint-disable-next-line consistent-return
exports.getUserBalance = async (req, res, next) => {
  try {
    const data = await User.findOne({ email: req.body.email });
    if (!data) {
      return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ balance: data.balance });
  } catch (error) {
    next(error);
  }
};

// Total reward sent by the user
exports.totalRewardSent = async (req, res, next) => {
  try {
    const user = await User.list({ email: req.body.email });

    const loggedInUserId = user[0]._id;
    const rewardSent = await Transaction.find({ userId: loggedInUserId });
    let total = 0;
    rewardSent.forEach((transaction) => {
      if (transaction.status === 'success') {
        total += transaction.amount;
      }
    });
    if (total === 0) {
      total = 0;
    } else {
      total -= user[0].balance;
    }
    // const newData = rewardSent.reduce((acc, curr) => acc + curr.amount, 0);
    return res.status(200).json({ total: total });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong fetching balance',
      error: error.message,
    });
  }
};

exports.getSingleTeacher = async (req, res, next) => {
  try {
    const teacherId = req.query.teacherId;
    const teacher = await Teacher.gets(teacherId);
    const transformedTeachers = teacher.transform();
    return res.status(200).json({
      message: 'Teacher fetched sucessfully',
      teacher: transformedTeachers,
    });
  } catch (error) {
    // return next(error);
    return res.status(500).json({
      message: 'Something went wrong fetching teacher',
      error: error.message,
    });
  }
};

// exports.getRewardsHistory = async (req, res, next) => {
//   try {
//     const rewards = await Reward.list(req.query);
//     const transformedRewards = rewards.map((reward) => reward.transform());
//     return res.json(transformedRewards);
//   } catch (error) {
//     return next(error);
//   }
// };

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e) => next(e));
};
