const httpStatus = require('http-status');
const crypto = require('crypto');
const moment = require('moment-timezone');
// const { omit } = require('lodash');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const PasswordResetToken = require('../models/passwordResetToken.model');
const { jwtExpirationInterval } = require('../../config/vars');
const APIError = require('../errors/api-error');
const emailProvider = require('../services/emails/emailProvider');
const Teacher = require('../models/teacher.model');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const accountId = crypto.randomBytes(6).toString('hex');

    const {
      email,
      fullName,
      password,
      virtual_account_id = accountId,
    } = req.body;

    const userData = {
      email,
      fullName,
      password,
      virtual_account_id,
    };

    const user = await new User(userData).save();
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns token and teacher if registration was successful
 * @public
 */
exports.teacher = async (req, res, next) => {
  try {
    const accountId = crypto.randomBytes(6).toString('hex');

    const {
      email,
      fullName,
      password,
      school,
      position,
      startYear,
      endYear,
      virtual_account_id = accountId,
    } = req.body;

    const teacherData = {
      email,
      fullName,
      password,
      school,
      position,
      startYear,
      endYear,
      virtual_account_id,
    };

    const teacher = await Teacher(teacherData).save();

    console.log(teacherData);

    const teacherTransformed = teacher.transform();

    const token = generateTokenResponse(teacher, teacher.token());

    res.status(httpStatus.CREATED);

    return res.json({ token, teacher: teacherTransformed });
  } catch (error) {
    return next(Teacher.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.status(200).json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

// rouute for teacherlogin : /auth/teacherlogin
// returns:id,token,userId,userEmail,

exports.teacherlogin = async (req, res, next) => {
  try {
    const { teacher, accessToken } = await Teacher.findAndGenerateToken(
      req.body,
    );
    const token = generateTokenResponse(teacher, accessToken);
    const teacherTransformed = teacher.transform();
    return res.json({ token, teacher: teacherTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.registerTeacher = async (req, res, next) => {
  try {
    const accountId = crypto.randomBytes(6).toString('hex');
    const {
      email,
      fullName,
      password,
      school,
      nin,
      startYear,
      endYear,
      schoolType,
      yearsOfTeaching,
      subjectTaught,
      period,
      virtual_account_id = accountId,
    } = req.body;

    const teacherData = {
      email,
      fullName,
      password,
      school,
      nin,
      startYear,
      endYear,
      schoolType,
      yearsOfTeaching,
      subjectTaught,
      period,
      virtual_account_id,
    };

    console.log(teacherData, 'passed from request');
    if (
      !email ||
      !fullName ||
      !password ||
      !school ||
      !nin ||
      !schoolType ||
      !yearsOfTeaching ||
      !subjectTaught
    ) {
      throw new Error('All fields are required');
    }

    const teacher = await Teacher(teacherData).save();
    console.log(teacherData);
    const teacherTransformed = teacher.transform();
    const token = generateTokenResponse(teacher, teacher.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, teacher: teacherTransformed });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({
      email,
      refreshObject,
    });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

exports.sendPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user) {
      const passwordResetObj = await PasswordResetToken.generate(user);
      emailProvider.sendPasswordReset(passwordResetObj);
      res.status(httpStatus.OK);
      return res.json('success');
    }
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'No account found with that email',
    });
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, resetToken } = req.body;
    const resetTokenObject = await PasswordResetToken.findOneAndRemove({
      userEmail: email,
      resetToken,
    });

    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (!resetTokenObject) {
      err.message = 'Cannot find matching reset token';
      throw new APIError(err);
    }
    if (moment().isAfter(resetTokenObject.expires)) {
      err.message = 'Reset token is expired';
      throw new APIError(err);
    }

    const user = await User.findOne({
      email: resetTokenObject.userEmail,
    }).exec();
    user.password = password;
    await user.save();
    emailProvider.sendPasswordChangeEmail(user);

    res.status(httpStatus.OK);
    return res.json('Password Updated');
  } catch (error) {
    return next(error);
  }
};

exports.logout = (req, res) => {
  req.logout();
  res.status(httpStatus.OK);
  return res.json({
    message: 'logout',
    redirect: '/v1/auth/login',
  });
};
