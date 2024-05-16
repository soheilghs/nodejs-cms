const Validator = require('./Validator');
const {check} = require('express-validator/check');

class ForgetPasswordValidator extends Validator {

  handle() {
    return [
      check('email')
        .isEmail()
        .withMessage('فیلد ایمیل معتبر نیست')
    ];
  }
}

module.exports = new ForgetPasswordValidator();