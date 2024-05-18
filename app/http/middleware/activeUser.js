const Middleware = require('./middleware');

class ActiveUser extends Middleware {

  handle(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.active) {
        return next();
      }

      req.logout( (err) => {
        this.alert(req, {
          title: 'توجه کنید',
          message: 'اکانت شما فعال نیست. لطفا از طریق فرم ورود اقدام به فعالسازی کنید',
          type: 'error',
          button: 'بسیار خب'
        });

        res.clearCookie('remember_token');
        res.redirect('/');
      });
    } else {
      next();
    }
  }
}

module.exports = new ActiveUser();