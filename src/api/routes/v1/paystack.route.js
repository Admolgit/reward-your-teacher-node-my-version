const express = require('express');
const { authorize, LOGGED_USER, authorized, LOGGED_TEACHER } = require('../../middlewares/auth');
const { Payment } = require('../../paystack/payment');
const { paystackCallback } = require('../../paystack/payment');
const { sendReward } = require('../../paystack/sendReward');
const { getWalletBalance } = require('../../paystack/balance');
const { getTotalMoneySent } = require('../../paystack/totalRewardSent');
const { Transfer } = require('../../paystack/transfer');
const { getTeacherBalance } = require('../../paystack/teacherBalance');
const controller = require('../../controllers/user.controller');

const router = express.Router();

/**
   * @api {post} /v1/paystack/pay Payment using Paystack
   * @apiDescription fundwallet using Paystack
   * @apiVersion 1.0.0
   * @apiName Initialize Payment
   * @apiGroup Payment
   * @apiPermission LoggedUser
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             [full name]       full name
   * @apiParam  {String}             [email]      email
   * @apiParam  {String=user,admin}  [amount]       amount
   *
   * @apiSuccess {Object[]} Ability to fund wallet.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
router.get('/paystack/pay', Payment);

// authorize(LOGGED_USER),

/**
   * @api {post} /v1/paystack/transfer Payment using Paystack
   * @apiDescription transfer to another wallet using Paystack
   * @apiVersion 1.0.0
   * @apiName Transfer Payment
   * @apiGroup Payment
   * @apiPermission LoggedUser
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             [full name]       full name
   * @apiParam  {String}             [email]      email
   * @apiParam  {String=user,admin}  [amount]       amount
   *
   * @apiSuccess {Object[]} Ability to fund wallet.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
router.post('/paystack/transfer', Transfer);

// authorize(LOGGED_USER),

/**
   * @api {get} /v1/paystack/callback Payment using Paystack
   * @apiDescription fundwallet using Paystack callback
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission LoggedUser
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {Object[]} Ability to fund wallet.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
router.get('/paystack/verify', paystackCallback);

/**
   * @api {Post} /v1/paystack/sendreward Payment using Paystack
   * @apiDescription Sending money by old student to a teacher
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission LoggedUser
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]            List page
   * @apiParam  {Number{1-100}}      [perPage=1]         Users per page
   * @apiParam  {String}             [name]              name
   * @apiParam  {String}             [sender email]      email
   * @apiParam  {String=user,admin}  [amount]            amount
   * @apiParam  {String=user,admin}  [account]           account
   * @apiParam  {String=user,admin}  [description]       description
   *
   * @apiSuccess {Object[]} Ability to send money from old student wallet to teacher wallet.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
router.post('/paystack/sendreward', authorize(LOGGED_USER), sendReward);

/**
   * @api {Post} /v1/paystack/balance/:id Get wallet balance
   * @apiDescription Get wallet balance
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission LoggedUser
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]            List page
   * @apiParam  {Number{1-100}}      [perPage=1]         Users per page
   *
   * @apiSuccess {Object[]} Ability to get wallet balance.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
router.get('/student-balance/:id', authorize(LOGGED_USER), getWalletBalance);

/**
   * @api {Post} /v1/paystack/teacher/:id Get teacher wallet balance
   * @apiDescription Get wallet balance
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission LoggedUser
   *
   * @apiHeader {String} Authorization   User's access token
   *
   // * @apiParam  {Number{1-}}         [page=1]            List page
   // * @apiParam  {Number{1-100}}      [perPage=1]         Users per page
   *
   * @apiSuccess {Object[]} Ability to get wallet balance.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
router.get('/teacher/:id', getTeacherBalance);

/**
   * @api {Post} /v1/paystack/balance/:id Get wallet balance
   * @apiDescription Get wallet balance
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission LoggedUser
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]            List page
   * @apiParam  {Number{1-100}}      [perPage=1]         Users per page
   *
   * @apiSuccess {Object[]} Ability to get wallet balance.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
*/
router.get('/paystack/moneysent/:id', authorize(LOGGED_USER), getTotalMoneySent);

router.get('/teacher-profile', authorize(LOGGED_USER), controller.getSingleTeacher);

module.exports = router;
