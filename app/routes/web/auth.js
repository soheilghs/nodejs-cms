const express = require('express');
const router = express.Router();
const passport = require("passport");
const csrf = require("csurf");

// Controllers
const LoginController =
  require('app/http/controllers/auth/LoginController');
const RegisterController =
  require('app/http/controllers/auth/RegisterController');
const ForgetPasswordController =
  require('app/http/controllers/auth/ForgetPasswordController');
const ResetPasswordController =
  require('app/http/controllers/auth/ResetPasswordController');

// Middlewares
const csrfErrorHandler =
  require("app/http/middleware/csrfErrorHandler");

//validators
const RegisterValidator =
  require('app/http/validators/RegisterValidator');
const LoginValidator =
  require('app/http/validators/LoginValidator');
const ForgetPasswordValidator =
  require('app/http/validators/ForgetPasswordValidator');
const ResetPasswordValidator =
  require('app/http/validators/ResetPasswordValidator');

router.use(csrf({cookie: true}));
router.use(csrfErrorHandler.handle);

router.get('/login',
  LoginController.showLoginForm);
router.post('/login',
  LoginValidator.handle(),
  LoginController.loginProcess);

router.get('/register',
  RegisterController.showRegisterationForm);
router.post('/register',
  RegisterValidator.handle(),
  RegisterController.registerProcess);

router.get('/password/reset',
  ForgetPasswordController.showForgetPassword);
router.post('/password/email',
  ForgetPasswordValidator.handle(),
  ForgetPasswordController.sendPasswordResetLink);

router.get('/password/reset/:token',
  ResetPasswordController.showResetPassword);
router.post('/password/reset',
  ResetPasswordValidator.handle(),
  ResetPasswordController.resetPasswordProcess);

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }));
router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/register'
  }));

module.exports = router;