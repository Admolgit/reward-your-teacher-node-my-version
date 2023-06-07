const express = require('express');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');
const { saveProfile } = require('../../controllers/profile.controller');
const controller = require('../../controllers/user.controller');

const router = express.Router();

router.post('/teacher/:teacherId', authorize(LOGGED_USER), saveProfile);

router.get('/teachers', authorize(LOGGED_USER), controller.getTeachers);

router.post('/totalrewardsent', authorize(LOGGED_USER), controller.totalRewardSent);

router.post('/user-balance', authorize(LOGGED_USER), controller.getUserBalance);

module.exports = router;
