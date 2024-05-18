const express = require('express');
const router = express.Router();

const forEveryOne = require('./public');
const forUser = require('./private');

const authenticateApi =
  require('app/http/middleware/authenticateApi');

router.use(forEveryOne);
router.use(authenticateApi.handle, forUser);

module.exports = router;