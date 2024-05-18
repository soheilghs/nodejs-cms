class csrfErrorHandler {

  async handle(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    res.send('form tampered with')
  }
}

module.exports = new csrfErrorHandler();