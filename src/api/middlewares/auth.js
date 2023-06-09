const httpStatus = require('http-status');
const passport = require('passport');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const APIError = require('../errors/api-error');
// const { teacher } = require('../controllers/auth.controller');

const LOGGED_USER = '_loggedUser';

const handleJWT = (req, res, next) => async (err, user, info) => {
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }

  req.user = user;

  return next();
};

// exports.ADMIN = ADMIN;
exports.LOGGED_USER = LOGGED_USER;

exports.authorize = (roles = User.roles) => (req, res, next) => passport.authenticate(
  'jwt', { session: false },
  handleJWT(req, res, next, roles),
)(req, res, next);

exports.oAuth = (service) => passport.authenticate(service, { session: false });
