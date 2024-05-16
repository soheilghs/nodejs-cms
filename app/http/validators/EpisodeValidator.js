const Validator = require('./Validator');
const {check} = require('express-validator/check');
const Course = require('app/models/Course');
const path = require('path');

class EpisodeValidator extends Validator {

  handle() {
    return [
      check('title')
        .isLength({min: 5})
        .withMessage('عنوان نمیتواند کمتر از 5 کاراکتر باشد'),
      check('type')
        .not().isEmpty()
        .withMessage('فیلد نوع دوره نمیتواند خالی بماند'),
      check('course')
        .not().isEmpty()
        .withMessage('فیلد دوره مربوطه نمیتواند خالی بماند'),
      check('body')
        .isLength({min: 20})
        .withMessage('متن دوره نمیتواند کمتر از 20 کاراکتر باشد'),
      check('videoUrl')
        .not().isEmpty()
        .withMessage('لینک دوره نمیتواند خالی بماند'),
      check('number')
        .not().isEmpty()
        .withMessage('شماره جلسه نمیتواند خالی بماند')
    ];
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g, "-");
  }
}

module.exports = new EpisodeValidator();