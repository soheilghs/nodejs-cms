const Middleware = require('./middleware');

class RedirectIfNotAuthenticated extends Middleware {

  handle(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    return res.redirect('/auth/login');
  }
}

module.exports = new RedirectIfNotAuthenticated();