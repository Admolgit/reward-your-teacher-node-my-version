const express = require('express');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');
const { saveProfile } = require('../../controllers/profile.controller');
const controller = require('../../controllers/user.controller');
const { getNotifications } = require('../../paystack/notification');
const authController = require('../../controllers/auth.controller');

const teacherRouter = express.Router();

teacherRouter.post('/teacher/:teacherId', authorize(LOGGED_USER), saveProfile);

teacherRouter.post('/teacher-register', authController.registerTeacher)

teacherRouter.get('/teacher-profile', authorize(LOGGED_USER), controller.getSingleTeacher);

teacherRouter.get('/teachers', authorize(LOGGED_USER), controller.getTeachers);

teacherRouter.post('/totalrewardsent', authorize(LOGGED_USER), controller.totalRewardSent);

teacherRouter.post('/user-balance', authorize(LOGGED_USER), controller.getUserBalance);

teacherRouter.get('/notification/:recieverId', getNotifications);

module.exports = teacherRouter;
