const Controller = require('app/http/controllers/Controller');
const Payment = require('app/models/Payment');
const rp = require("request-promise");
const ActivationCode =
  require('app/models/ActivationCode');

class UserController extends Controller {

  async index(req, res, next) {
    try {
      res.render('home/panel/index', {
        title: 'پنل کاربری'
      });
    } catch (err) {
      next(err);
    }
  }

  async activation(req, res, next) {
    try {
      let activationCode =
        await ActivationCode.findOne({
          code: req.params.code
        }).populate('user').exec();

      if (!activationCode) {
        this.alert(req, {
          title: 'دقت کنید',
          message: 'چنین لینکی برای فعال سازی وجود ندارد',
          button: 'بسیار خب',
          type: 'error'
        });

        return res.redirect('/');
      }

      if (activationCode.expire < new Date()) {
        this.alert(req, {
          title: 'دقت کنید',
          message: 'مهلت استفاده از این لینک به پایان رسیده است',
          button: 'بسیار خب',
          type: 'error'
        });

        return res.redirect('/');
      }

      if (activationCode.used) {
        this.alert(req, {
          title: 'دقت کنید',
          message: 'این لینک قبلا مورد استفاده قرار گرفته است',
          button: 'بسیار خب',
          type: 'error'
        });

        return res.redirect('/');
      }

      let user = activationCode.user;
      user.$set({
        active: true
      });
      activationCode.$set({
        used: true
      });

      await user.save();
      await activationCode.save();

      req.login(user, err => {
        user.setRememberToken(res);

        this.alert(req, {
          title: 'با تشکر',
          message: 'اکانت شما فعال شد',
          type: 'success',
          button: 'بسیار خب'
        });

        return res.redirect('/');
      });
    } catch (err) {
      next(err);
    }
  }

  async history(req, res, next) {
    try {
      let page = req.query.page || 1;
      let payments =
        await Payment.paginate({
          user: req.user.id
        }, {
          page,
          sort: {createdAt: -1},
          limit: 20,
          populate: 'course'
        });
      res.render('home/panel/history', {
        title: 'پرداختی ها',
        payments
      });
    } catch (err) {
      next(err);
    }
  }

  async vip(req, res) {
    res.render('home/panel/vip');
  }

  async vipPayment(req, res, next) {
    try {
      let plan = req.body.plan,
        price = 0;

      switch (plan) {
        case "3":
          price = 30000
          break;
        case "12":
          price = 90000
          break;
        default:
          price = 10000;
      }

      // Buy Process
      let params = {
        merchant_id: '7089f888-f901-11e7-80c9-000c295eb8fc',
        //merchant_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        //amount: 1000,
        amount: price * 10,
        callback_url: 'http://localhost:3000/user/panel/vip/payment/check',
        description: `بابت افزایش اعتبار ویژه`,
        metadata: {
          email: req.user.emai
        }
      };

      let options = this.getUrlOption(
        'https://api.zarinpal.com/pg/v4/payment/request.json',
        params);

      rp(options)
        .then(async result => {
          let payment = new Payment({
            user: req.user.id,
            vip: true,
            res_number: result.data.authority,
            price: price
          });

          await payment.save();

          res.redirect(`https://www.zarinpal.com/pg/StartPay/${result.data.authority}`);
        })
        .catch(err => res.json(err.message));
    } catch (err) {
      next(err);
    }
  }

  async vipCheckPayment(req, res, next) {
    try {
      if (req.query.Status && req.query.Status !== 'OK') {
        // copy from CourseController
      }

      let payment =
        await Payment.findOne({
          res_number: req.query.Authority
        }).exec();

      if (!payment.vip) {
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'این تراکنش مربوط به افزایش اعتبار اعضای ویژه نمی شود',
          type: 'error'
        });
      }

      payment.set({
        payed: true
      });

      await payment.save();

      let time = 0,
        type = '';

      switch (payment.price) {
        case 10000:
          time = 1;
          type = 'month';
          break;
        case 30000:
          time = 3;
          type = '3month';
          break;
        case 90000:
          time = 12;
          type = '12month';
          break;
      }

      if (time == 0) {
        this.alert(req, {
          title: 'دقت کنید',
          message: 'عملیات پرداخت با موفقیت انجام نشد',
          type: 'error',
          button: 'بسیار خب'
        });

        return res.redirect('/user/panel/vip');
      }

      let vipTime = req.user.isVip() ? new Date(req.user.vipTime)
        : new Date();
      vipTime.setMonth(vipTime.getMonth() + time);

      req.user.set({
        vipTime,
        vipType: type
      });

      await req.user.save();

      this.alert(req, {
        title: 'با تشکر',
        message: 'عملیات پرداخت با موفقیت انجام شد',
        type: 'success',
        button: 'بسیار خب'
      });

      return res.redirect('/user/panel/vip');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();