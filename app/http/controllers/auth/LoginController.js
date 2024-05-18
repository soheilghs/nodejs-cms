const Controller =
  require('app/http/controllers/Controller');
const passport = require('passport');
const ActivationCode =
  require('app/models/ActivationCode');
const uniqueString =
  require('unique-string');
const mail = require('app/helpers/mail');

class LoginController extends Controller {

  showLoginForm(req, res) {
    const title = 'صفحه ورود';
    res.render('home/auth/login',
      {
        recaptcha: this.recaptcha.render(),
        title
      });
  }

  async loginProcess(req, res, next) {
    await this.recaptchaValidation(req, res);
    let result = await this.validationData(req);

    if (result) {
      return this.login(req, res, next);
    }

    return this.back(req, res);
  }

  async login(req, res, next) {
    passport.authenticate('local.login',
      async (err, user) => {
      if (!user) {
        return res.redirect('/auth/login');
      }

      if (!user.active) {
        // create activationCode
        let activeCode =
          await ActivationCode.find({user: user.id})
            .gt('expire', new Date())
            .sort({createdAt: 1})
            .populate('user')
            .limit(1).exec();

        if (activeCode.length) {
          this.alertAndBack(req, res, {
            title: 'توجه کنید',
            message: 'لینک فعال سازی اکانت به ایمیل شما ارسال شده.برای ارسال دوباره لطفا ده دقیقه صبر کنید و دوباره اقدام به ورود کنید',
            button: 'بسیار خب'
          });

          return;
        } else {
          let code = uniqueString();
          let newActiveCode =
            new ActivationCode({
              user: user.id,
              code,
              expire: Date.now() + 1000 * 60 * 10
            });

          await newActiveCode.save();

          let mailOptions = {
            from: '"مجله آموزشی نت سورس 👻" <info@netsource.ir>', // sender address
            to: `${user.email}`, // list of receivers
            subject: "فعال سازی اکانت", // Subject line
            html: `<h2>
              فعال سازی اکانت
             </h2>
             <p>برای فعال سازی اکانت بر روی لینک زیر کلیک کنید</p>
             <a href="${config.site_url}/user/activation/${newActiveCode.code}">
               فعال سازی
             </a>`
          }

          mail.sendMail(mailOptions, (err, info) => {
            if (err) {
              return console.log(err);
            }

            console.log("Message Sent: %s", info.messageId);

            this.alert(req,{
              title: 'دقت کنید',
              message: 'ایمیل حاوی لینک فعال سازی به ایمیل شما ارسال شد',
              type: 'success',
              button: 'بسیار خب'
            });

            return res.redirect('/');
          });

          return;
        }
      }

      req.login(user, err => {
        if (req.body.remember) {
          user.setRememberToken(res);
        }

        return res.redirect('/');
      });
    })(req, res, next);
  }
}

module.exports = new LoginController();