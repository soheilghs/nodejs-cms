class ErrorHandler {

  async error404(req, res, next) {
    try {
      res.statusCode = 404;
      throw new Error('چنین صفحه ای یافت نشد');
    } catch (err) {
      next(err);
    }
  }

  async handler(err, req, res, next) {
    const statusCode = err.status || 500;
    const message = err.message || '';
    const stack = err.stack || '';

    const layouts = {
      layout: 'errors/master',
      extractScripts: false,
      extractStyles: false
    };

    if (config.debug) {
      return res.render('errors/stack',
        {...layouts, message, stack});
    }

    return res.render(`errors/${statusCode}`,
      {...layouts, message, stack});
  }
}

module.exports = new ErrorHandler();