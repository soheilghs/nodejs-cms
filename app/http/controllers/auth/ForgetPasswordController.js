const Controller = require('app/http/controllers/Controller');
const PasswordReset = require('app/models/PasswordReset');
const User = require('app/models/User');
const uniqueString = require('unique-string');
const mail = require('app/helpers/mail');

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


    let mailOptions = {
      from: '"مجله آموزشی نت سورس 👻" <info@netsource.ir>', // sender address
      to: `${newPasswordReset.email}`, // list of receivers
      subject: "بازبابی رمز عبور", // Subject line
      html: `<h2>
              بازیابی رمز
             </h2>
             <p>برای بازیابی رمز بر روی لینک زیر کلیک کنید</p>
             <a href="${config.site_url}/auth/password/reset/${newPasswordReset.token}">
               بازیابی
             </a>`
    }

    mail.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.log(err);
      }

      console.log("Message Sent: %s", info.messageId);

      this.alert(req,{
        title: 'دقت کنید',
        message: 'ایمیل حاوی لینک بازیابی رمز به ایمیل شما ارسال شد',
        type: 'success'
      });

      return res.redirect('/');
    });

    //req.flash('success', 'ایمیل بازیابی رمز عبور با موفقیت ارسال شد');
    res.redirect('/');
  }
}

module.exports = new ForgetPasswordController();