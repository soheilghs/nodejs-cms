const express =
  require('express');
const router = express.Router();
const cors =
  require('cors');

/*const RateLimit =
  require('express-rate-limit');
const apiLimiter = new RateLimit({
  windowMs: 1000 * 60 * 15,
  max: 40,
  //message: "درخواست شما زیاد بوده. لطفا 15 دقیقه دیگر دوباره تلاش کنید"
  handler: function (req, res) {
    res.json({
      data: "درخواست شما زیاد بوده. لطفا 15 دقیقه دیگر دوباره تلاش کنید",
      status: "error"
    });
  }
});*/

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

//router.use('/api/v1', apiLimiter,  api_v1);
router.use('/api/v1', cors(),  api_v1);
//router.use('/api/v2', api_v2);

module.exports = router;