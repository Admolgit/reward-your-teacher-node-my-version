const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const teacherRouter = require('./teacher.route');
const paystack = require('./paystack.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => {
  console.log('status');
  res.send('OK');
});

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/teachers', teacherRouter);
router.use('/', paystack);

module.exports = router;
