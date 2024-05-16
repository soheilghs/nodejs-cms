const Validator = require('./Validator');
const {check} = require('express-validator/check');
const Category = require('app/models/Category');

class CategoryValidator extends Validator {

  handle() {
    return [
      check('name')
        .isLength({min: 3})
        .withMessage('عنوان نمیتواند کمتر از 3 کاراکتر باشد')
        .custom(async (value, {req}) => {
          if (req.query._method === 'put') {
            let cat = await Category.findById(req.params.id);

            if (cat.slug === this.slug(value)) {
              return;
            }
          }

          let cat = await Category.findOne({
            slug: this.slug(value)
          });

          if (cat) {
            throw new Error('چنین دسته ای با این عنوان قبلا در سایت قرار داده شده است');
          }
        }),

      check('parent')
        .not().isEmpty()
        .withMessage('فیلد دسته والد نمیتواند خالی بماند')
    ];
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g, "-");
  }
}

module.exports = new CategoryValidator();