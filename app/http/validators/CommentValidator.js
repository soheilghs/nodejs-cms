const Validator = require('./Validator');
const {check} = require('express-validator/check');

class CommentValidator extends Validator {

  handle() {
    return [
      check('body')
        .isLength({min: 10})
        .withMessage('متن نظر نمیتواند کمتر از 10 کاراکتر باشد'),
    ];
  }
}

module.exports = new CommentValidator();