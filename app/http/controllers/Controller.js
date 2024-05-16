const autoBind = require('auto-bind');
const {validationResult} = require("express-validator/check");
const Recaptcha = require('express-recaptcha').Recaptcha;
const sprintf = require('sprintf-js').sprintf;
const isMongoId = require('validator/lib/isMongoId');

module.exports = class Controller {

  constructor() {
    autoBind(this);
    this.recaptchaConfig();
  }

  recaptchaConfig() {
    this.recaptcha = new Recaptcha(
      config.service.recaptcha.client_key,
      config.service.recaptcha.secret_key,
      {...config.service.recaptcha.options});
  }

  recaptchaValidation(req, res) {
    return new Promise((resolve, reject) => {
      this.recaptcha.verify(req, (err, data) => {
        if (err) {
          req.flash('errors',
            'گزینه امنیتی مربوط به شناسایی ربات خاموش است، لطفا از فعال بودن آن اطمینان حاصل کنید و مجدد امتحان نمایید');
          this.back(req, res);
        } else {
          resolve(true);
        }
      });
    });
  }

  async validationData(req) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array();
      const messages = [];
      errors.forEach(error => messages.push(error.msg));

      req.flash('errors', messages);
      return false;
    }

    return true;
  }

  back(req, res) {
    req.flash('formData', req.body);
    return res.redirect(req.header('Referrer') || '/');
  }

  getTime(episodes) {
    let second = 0;

    episodes.forEach(episode => {
      let time = episode.time.split(':');

      if (time.length === 2) {
        second += parseInt(time[0]) * 60;
        second += parseInt(time[1]);
      } else if (time.length === 3) {
        second += parseInt(time[0]) * 3600;
        second += parseInt(time[1]) * 60;
        second += parseInt(time[2]);
      }
    });

    let minutes = Math.floor(second / 60);
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    second = Math.floor(((second / 60) % 1) * 60);

    return sprintf('%02d:%02d:%02d', hours, minutes, second);
  }

  isMongoId(paramId) {
    if (!isMongoId(paramId)) {
      this.error('آی دی وارد شده صحیح نیست', 404);
    }
  }

  error(message, status = 500) {
    let err = new Error(message);
    err.status = status;
    throw err;
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-zA-Z0-9]|-)+/g, "-");
  }

  alert(req, data) {
    let title = data.title || '',
      message = data.message || '',
      type = data.type || 'info',
      button = data.button || null,
      timer = data.timer || 2000;

    req.flash('sweetalert',
      {title, message, type, button, timer});
  }

  alertAndBack(req, res, data) {
    this.alert(req, data);
    return this.back(req, res);
  }

  getUrlOption(url, params) {
    return {
      method: 'POST',
      uri: url,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      },
      body: params,
      json: true
    };
  }
}