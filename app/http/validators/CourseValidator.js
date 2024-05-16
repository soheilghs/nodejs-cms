const Validator = require('./Validator');
const {check} = require('express-validator/check');
const Course = require('app/models/Course');
const path = require('path');

class CourseValidator extends Validator {

  handle() {
    return [
      check('title')
        .isLength({min: 5})
        .withMessage('عنوان نمیتواند کمتر از 5 کاراکتر باشد')
        .custom(async (value, {req}) => {
          if (req.query._method === 'put') {
            let course = await Course.findById(req.params.id);

            if (course.title === value) {
              return;
            }
          }

          let course = await Course.findOne({
            slug: this.slug(value)
          });

          if (course) {
            throw new Error('چنین دوره ای با این عنوان قبلا در سایت قرار داده شده است');
          }
        }),

      check('images').custom(async (value, {req}) => {
        if (req.query._method === 'put' && value === undefined) {
          return;
        }

        if (!value) {
          throw new Error('وارد کردن تصویر الزامی است');
        }

        let fileExt = ['.png', '.jpg', '.jpeg', '.svg'];

        if (!fileExt.includes(path.extname(value))) {
          throw new Error('پسوند فایل وارد شده از پسوندهای تصاویر نیست');
        }
      }),

      check('type')
        .not().isEmpty()
        .withMessage('فیلد نوع دوره نمیتواند خالی بماند'),
      check('body')
        .isLength({min: 20})
        .withMessage('متن دوره نمیتواند کمتر از 20 کاراکتر باشد'),
      check('price')
        .not().isEmpty()
        .withMessage('قیمت دوره نمیتواند خالی بماند'),
      check('tags')
        .not().isEmpty()
        .withMessage('فیلد تگ نمیتواند خالی بماند')
    ];
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g, "-");
  }
}

module.exports = new CourseValidator();