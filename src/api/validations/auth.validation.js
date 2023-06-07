const Joi = require('joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: {
      fullName: Joi.string()
        .required()
        .max(60),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .required()
        .min(6)
        .max(128),
    },
  },

  // // Teacher /v1/auth/teacher/register
  // teacherValidator: {
  //   body: {
  //     name: Joi.string()
  //       .required()
  //       .max(128),
  //     school: Joi.string()
  //       .required()
  //       .max(128),
  //     position: Joi.string()
  //       .required()
  //       .max(128),
  //     startYear: Joi.string()
  //       .required()
  //       .max(128),
  //     endYear: Joi.string()
  //       .required()
  //       .max(128),
  //   },
  // },

  // Teacher /v1/auth/teacher/register
  teacherValidator: {
    body: {
      fullName: Joi.string()
        .required()
        .max(128),
      email: Joi.string()
        .required()
        .max(128),
      password: Joi.string()
        .required()
        .max(128),
      school: Joi.string()
        .required()
        .max(128),
      position: Joi.string()
        .max(128),
      yearsOfTeaching: Joi.string()
        .required()
        .max(12),
      startYear: Joi.number()
      .required()
      .min(4),
      endYear: Joi.number()
      .required()
      .min(4),
      nin: Joi.string()
        .required()
        .max(15),
      schoolType: Joi.array()
        .required()
        .max(15),
      subjectTaught: Joi.array()
        .required()
        .max(15),
    },
  },

  // POST /v1/auth/login
  login: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .required()
        .max(128),
    },
  },

  // POST /v1/auth/facebook
  // POST /v1/auth/google
  oAuth: {
    body: {
      access_token: Joi.string().required(),
    },
  },

  // POST /v1/auth/refresh
  refresh: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      refreshToken: Joi.string().required(),
    },
  },

  // POST /v1/auth/refresh
  sendPasswordReset: {
    body: {
      email: Joi.string()
        .email()
        .required(),
    },
  },

  // POST /v1/auth/password-reset
  passwordReset: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .required()
        .min(6)
        .max(128),
      resetToken: Joi.string().required(),
    },
  },
};
