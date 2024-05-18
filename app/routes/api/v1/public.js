const express = require('express');
const router = express.Router();

// Validators
const LoginValidator =
  require('app/http/validators/LoginValidator');

// Controllers
const CourseController =
  require('app/http/controllers/api/v1/CourseController');
const AuthController =
  require('app/http/controllers/api/v1/AuthController');

router.get('/courses', CourseController.index);
router.get('/courses/:course', CourseController.single);
router.get('/courses/:course/comments',
  CourseController.getComments);

router.post('/login',
  LoginValidator.handle(),
  AuthController.login);

module.exports = router;