const Middleware = require('./middleware');

class RedirectIfNotAdmin extends Middleware {

  handle(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
      return next();
    }

    return res.redirect('/');
  }
}

module.exports = new RedirectIfNotAdmin();