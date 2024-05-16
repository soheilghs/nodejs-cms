const express = require('express');
const router = express.Router();

// Controllers
const HomeController =
  require('app/http/controllers/HomeController');
const CourseController =
  require('app/http/controllers/CourseController');
const UserController =
  require('app/http/controllers/UserController');

// Validators
const CommentValidator =
  require('app/http/validators/CommentValidator');

// Middlewares
const redirectIfNotAuthenticated =
  require('app/http/middleware/redirectIfNotAuthenticated');
const convertFileToField =
  require('app/http/middleware/convertFileToField');

// Helpers
const upload = require('app/helpers/UploadImage');

router.get('/logout', (req,
                       res) => {
  req.logout(function (err) {
    res.clearCookie('remember_token');
    res.redirect('/');
  });
});

//Home Routes
router.get('/', HomeController.index);
router.get('/about-me', HomeController.about);
router.get('/courses', CourseController.index);
router.get('/courses/:course', CourseController.single);
router.post('/courses/payment',
  redirectIfNotAuthenticated.handle,
  CourseController.payment);
router.get('/courses/payment/check',
  redirectIfNotAuthenticated.handle,
  CourseController.checkPayment);

router.get('/download/:episode', CourseController.download);

router.post('/comment',
  redirectIfNotAuthenticated.handle,
  CommentValidator.handle(),
  HomeController.comment);

router.get('/user/panel', UserController.index);
router.get('/user/panel/history', UserController.history);
router.get('/user/panel/vip', UserController.vip);
router.post('/user/panel/vip/payment',
  UserController.vipPayment);
router.get('/user/panel/vip/payment/check',
  UserController.vipCheckPayment);

router.get('/sitemap.xml', HomeController.sitemap);
router.get('/feed/courses', HomeController.coursesFeed);
router.get('/feed/episodes', HomeController.episodesFeed);

router.get('/ajax-upload', (req,
                            res,
                            next) => {
  res.render('home/ajax-upload');
});

router.post('/ajax-upload',
  upload.single('photo'),
  convertFileToField.handle,
  (req,
   res,
   next) => {
    try {
      res.json({
        ...req.body,
        ...req.file
      });
    } catch (err) {
      next(err);
    }
  });

module.exports = router;