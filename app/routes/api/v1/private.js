const express = require('express');
const router = express.Router();

const HomeController =
  require('app/http/controllers/api/v1/HomeController');

router.get('/user', HomeController.user);
router.get('/user/history', HomeController.history);

module.exports = router;