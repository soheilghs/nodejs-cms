const express = require('express');
const router = express.Router();

const api_v1 = require('./v1');
//const api_v2 = require('./v2');

router.use((req,
            res,
            next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept")
  next();
});

router.use('/api/v1', api_v1);
//router.use('/api/v2', api_v2);

module.exports = router;