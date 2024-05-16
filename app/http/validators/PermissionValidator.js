const Validator = require('./Validator');
const {check} = require('express-validator/check');
const Permission = require('app/models/Permission');

class PermissionValidator extends Validator {

  handle() {
    return [
      check('name')
        .isLength({min: 3})
        .withMessage('عنوان نمیتواند کمتر از 3 کاراکتر باشد')
        .custom(async (value, {req}) => {
          if (req.query._method === 'put') {
            let permission = await Permission.findById(req.params.id);

            if (permission.name === value) {
              return;
            }
          }

          let permission = await Permission.findOne({
            name: value
          });

          if (permission) {
            throw new Error('چنین اجازه دسترسی با این عنوان قبلا در سایت قرار داده شده است');
          }
        }),

      check('label')
        .not().isEmpty()
        .withMessage('فیلد توضیح نمیتواند خالی بماند')
    ];
  }
}

module.exports = new PermissionValidator();