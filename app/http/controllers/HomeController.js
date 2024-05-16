const Controller = require('app/http/controllers/Controller');
const Course = require('app/models/Course');
const Episode = require('app/models/Episode');
const Comment = require('app/models/Comment');
const sm = require('sitemap');
const Rss = require('rss');
const striptags = require('striptags');

class HomeController extends Controller {
  async index(req, res) {
    let courses =
      await Course.find({
        lang: req.getLocale()
      })
        .sort({createdAt: -1})
        .limit(8).exec();
    res.render('home/index', {courses});
  }

  async about(req, res) {
    res.render('home/about');
  }

  async comment(req, res, next){
    try {
      let status = await this.validationData(req);

      if (!status) {
        return this.back(req, res);
      }

      let newComment  = new Comment({
        user: req.user.id,
        ...req.body
      });

      await newComment.save();
      return this.back(req, res);
    } catch (err) {
      next(err);
    }
  }

  async sitemap(req, res, next) {
    try {
      let sitemap = sm.createSitemap({
        hostname: config.site_url,
        //cacheTime: 600000
      });

      sitemap.add({
        url: '/',
        changefreq: 'daily',
        priority: 1
      });
      sitemap.add({
        url: '/courses',
        priority: 1
      });

      let courses =
        await Course.find({}).sort({createdAt: -1})
          .exec();
      courses.forEach(course => {
        sitemap.add({
          url: course.path(),
          changefreq: 'weekly',
          priority: 0.8
        });
      })

      let episodes =
        await Episode.find({}).populate('course')
          .sort({createdAt: -1}).exec();
      episodes.forEach(episode => {
        sitemap.add({
          url: episode.path(),
          changefreq: 'weekly',
          priority: 0.8
        });
      })

      res.header('Content-type', 'application/xml');
      res.send(sitemap.toString());
    } catch (err) {
      next(err);
    }
  }

  async coursesFeed(req, res, next) {
    try {
      let feed = new Rss({
        title: 'فید خوان دوره های نت سورس',
        description: 'جدیدترین دوره ها را از طریق  بخوانیدrss',
        feed_url: `${config.site_url}/feed/courses`,
        site_url: config.site_url
      });

      let courses =
        await Course.find({}).populate('user')
          .sort({createdAt: -1}).exec();
      courses.forEach(course => {
        feed.item({
          title: course.title,
          description: striptags(course.body.substring(0, 100)),
          date: course.createdAt,
          url: course.path(),
          author: course.user.name
        });
      })

      res.header('Content-type', 'application/xml');
      res.send(feed.xml());
    } catch (err) {
      next(err);
    }
  }

  async episodesFeed(req, res, next) {
    try {
      let feed = new Rss({
        title: 'فید خوان جلسات دوره های نت سورس',
        description: 'جدیدترین دوره ها را از طریق  بخوانیدrss',
        feed_url: `${config.site_url}/feed/courses`,
        site_url: config.site_url
      });

      let episodes =
        await Episode.find({})
          .populate({path: 'course', populate: 'user'})
          .sort({createdAt: -1}).exec();
      episodes.forEach(episode => {
        feed.item({
          title: episode.title,
          description: striptags(episode.body.substring(0, 100)),
          date: episode.createdAt,
          url: episode.path(),
          author: episode.course.user.name
        });
      })

      res.header('Content-type', 'application/xml');
      res.send(feed.xml());
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HomeController();