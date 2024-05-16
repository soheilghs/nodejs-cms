const Controller = require('app/http/controllers/Controller');
const passport = require('passport');
const PasswordReset = require('app/models/PasswordReset');
const User = require('app/models/User');
const uniqueString = require('unique-string');

class ForgetPasswordController extends Controller {

  showForgetPassword(req, res) {
    const title = 'فراموشی رمز عبور';
    res.render('home/auth/passwords/email',
      {
        recaptcha: this.recaptcha.render(),
        title
      });
  }

  async sendPasswordResetLink(req, res) {
    await this.recaptchaValidation(req, res);
    let result = await this.validationData(req);

    if (result) {
      return this.sendResetLink(req, res);
    }

    return this.back(req, res);
  }

  async sendResetLink(req, res) {
    let user = await User.findOne({email: req.body.email});
    if (!user) {
      req.flash('errors', 'چنین کاربری وجود ندارد');
      return this.back(req, res);
    }

    const newPasswordReset = new PasswordReset({
      email: req.body.email,
      token: uniqueString()
    });

    await newPasswordReset.save();

    // Send Mail
    //req.flash('success', 'ایمیل بازیابی رمز عبور با موفقیت ارسال شد');
    res.redirect('/');
  }
}

module.exports = new ForgetPasswordController();