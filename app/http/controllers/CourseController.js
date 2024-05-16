const Controller = require('app/http/controllers/Controller');
const Course = require('app/models/Course');
const Episode = require('app/models/Episode');
const Category = require('app/models/Category');
const path = require('path');
const fs = require('fs');
const bcrypt = require("bcrypt");
//const Learning = require('app/models/Learning');
const Payment = require('app/models/Payment');
const rp = require('request-promise');
const {data} = require("express-session/session/cookie");
const {request} = require("express");

class CourseController extends Controller {

  async index(req, res) {
    let query = {};
    let {search, type, cat} = req.query;

    if (search) {
      query.title = new RegExp(req.query.search, 'gi');
    }

    if (type && type != 'all') {
      query.type = req.query.type;
    }

    if (cat && cat != 'all') {
      let category =
        await Category.findOne({
          slug: cat
        });

      if (category) {
        query.categories = {
          $in: [category.id]
        };
      }
    }

    let page = req.query.page || 1;

    let options = {
      page,
      limit: 6,
      sort: {createdAt: -1}
    };

    if (req.query.order) {
      options['sort'] = {createdAt: 1};
    }

    let courses = await Course.paginate({...query}, options);
    let categories = await Category.find({});

    res.render('home/courses',
      {courses, categories});
  }

  async single(req, res) {
    /*let learning = new Learning({
      user: req.user.id,
      course: '65f30834588fc80f509d65b1'
    });

    await learning.save();*/

    let course =
      await Course.findOneAndUpdate({slug: req.params.course},
        {
          $inc: {
            viewCount: 1
          }
        })
        .populate([
          {
            path: 'user',
            select: 'name'
          },
          {
            path: 'episodes',
            options: {
              sort: {number: 1}
            }
          }
        ])
        .populate([{
          path: 'comments',
          match: {
            parent: {
              $eq: null
            },
            approved: true
          },
          populate: [
            {
              path: 'user',
              select: 'name'
            },
            {
              path: 'comments',
              match: {
                approved: true
              },
              populate: {
                path: 'user',
                select: 'name'
              }
            }
          ]
        }]);

    let categories =
      await Category.find({parent: null})
        .populate('children').exec();

    res.render('home/single-course',
      {course, categories});
  }

  async download(req, res, next) {
    try {
      this.isMongoId(req.params.episode);
      let episode =
        await Episode.findById(req.params.episode);
      if (!episode) {
        this.error('چنین فایلی برای این جلسه وجود ندارد', 404);
      }

      if (!this.checkHash(req, episode)) {
        this.error('اعتبار لینک شما به پایان رسیده است', 403);
      }

      let filePath =
        path.resolve(`./public/download/ASGLKET!1241tgsdq415215/${episode.videoUrl}`);
      if (!fs.existsSync(filePath)) {
        this.error('چنین فایلی برای دانلود وجود ندارد', 404);
      }

      /*await Episode.updateOne({_id: episode._id},
            {
              $inc: {downloadCount: 1}
            });*/

      res.download(filePath, async (err) => {
        if (err) {
          console.log(err);
          next(err);
        } else {
          await episode.inc('downloadCount');
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async payment(req, res, next) {
    try {
      this.isMongoId(req.body.course);

      let course =
        await Course.findById(req.body.course);

      if (!course) {
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'چنین دوره ای یافت نشد',
          type: 'error',
          button: 'متوجه شدم'
        });
      }

      if (await req.user.checkLearning(course.id)) {
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'شما قبلا در این دوره ثبت نام کرده اید.',
          type: 'error',
          button: 'متوجه شدم'
        });
      }

      if (course.price == 0 &&
        (course.type == 'vip' || course.type == 'free')) {
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'این دوره مخصوص اعضای ویژه یا رایگان است و قابل خریداری نیست',
          type: 'error',
          button: 'متوجه شدم'
        });
      }

      // Buy Process
      let params = {
        merchant_id: '7089f888-f901-11e7-80c9-000c295eb8fc',
        //merchant_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        //amount: 1000,
        amount: course.price * 10,
        callback_url: 'http://localhost:3000/courses/payment/check',
        description: `بابت خرید دوره ${course.title}`,
        metadata: {
          email: req.user.emai
        }
      };

      let options = this.getUrlOption(
        'https://api.zarinpal.com/pg/v4/payment/request.json',
        params);

      rp(options)
        .then(async result => {
          let payment = new Payment({
            user: req.user.id,
            course: course.id,
            res_number: result.data.authority,
            price: course.price
          });

          await payment.save();

          res.redirect(`https://www.zarinpal.com/pg/StartPay/${result.data.authority}`);
        })
        .catch(err => res.json(err.message));
    } catch (err) {
      next(err);
    }
  }

  async checkPayment(req, res, next) {
    try {
      if (req.query.Status && req.query.Status !== 'OK') {
        /*return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'پرداخت شما با موفقیت انجام نشد',
          type: 'error'
        });*/
      }

      let payment =
        await Payment.findOne({
          res_number: req.query.Authority
        }).populate('course').exec();

      if (!payment.course) {
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'دوره ای که شما پرداخت کرده اید وجود ندارد',
          type: 'error'
        });
      }

      payment.set({
        payed: true
      });

      req.user.learning.push(payment.course.id);
      await payment.save();
      await req.user.save();

      this.alert(req, {
        title: 'با تشکر',
        message: 'عملیات پرداخت با موفقیت انجام شد',
        type: 'success',
        button: 'بسیار خب'
      });

      return res.redirect(payment.course.path());

      /*let params = {
        merchant_id: '7089f888-f901-11e7-80c9-000c295eb8fc',
        //merchant_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        amount: payment.course.price * 10,
        authority: req.query.Authority
      };

      let options = this.getUrlOption(
        'https://api.zarinpal.com/pg/v4/payment/verify.json',
        params);*/

      /*rp(options)
        .then(async data => {
          if (data.Status == 100) {
            payment.set({
              payed: true
            });

            req.user.learning.push(payment.course.id);
            await payment.save();
            await req.user.save();

            this.alert(req, {
              title: 'با تشکر',
              message: 'عملیات پرداخت با موفقیت انجام شد',
              type: 'success',
              button: 'بسیار خب'
            });

            return res.redirect(payment.course.path());
          } else {
            return this.alertAndBack(req, res, {
              title: 'دقت کنید',
              message: 'پرداخت شما با موفقیت انجام نشد',
              type: 'error'
            });
          }
        })
        .catch(err => {
          next(err);
        });*/
    } catch (err) {
      next(err);
    }
  }

  checkHash(req, episode) {
    let timestamps = new Date().getTime();

    if (req.query.t < timestamps) {
      return false;
    }

    let text = `aQTR@!#Fa#%!@%SDQGGASDF${episode.id}${req.query.t}`;
    return bcrypt.compareSync(text, req.query.mac);
  }
}

module.exports = new CourseController();