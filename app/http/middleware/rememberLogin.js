const User = require('app/models/User');
const Middleware = require('./middleware');

class RememberLogin extends Middleware {

  handle(req, res, next) {
    if (!req.isAuthenticated()) {
      const rememberToken = req.signedCookies.remember_token;
      if (rememberToken) {
        return this.userFind(rememberToken, req, next);
      }
    }

    next();
  }

  userFind(rememberToken, req, next) {
    User.findOne({rememberToken})
      .then(user => {
        if (user) {
          req.login(user, err => {
            if (err) {
              next(err);
            }

            next();
          });
        } else {
          next();
        }
      })
      .catch(err => next(err));
  }
}

module.exports = new RememberLogin();