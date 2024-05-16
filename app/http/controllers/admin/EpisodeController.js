const Controller = require('app/http/controllers/Controller');
const Course = require('app/models/Course');
const Episode = require('app/models/Episode');

class EpisodeController extends Controller {

  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let episodes = await Episode.paginate({}, {
        page,
        sort: {createdAt: -1},
        limit: 2
      });

      res.render('admin/episodes/index', {
        title: 'ویدیوها',
        episodes
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res) {
    let courses = await Course.find({});
    res.render('admin/episodes/create', {courses});
  }

  async store(req, res, next) {
    try {
      let status = await this.validationData(req);

      if (!status) {
        return this.back(req, res);
      }

      let newEpisode =
        new Episode({...req.body});
      await newEpisode.save();

      // update course time
      await this.updateCourseTime(req.body.course);

      // Update Course Times
      return res.redirect('/admin/episodes');
    } catch (err) {
      next(err);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let episode = await Episode.findById(req.params.id);
      let courses = await Course.find({});

      if (!episode) {
        this.error('چنین ویدیویی وجود ندارد!', 404);
      }

      return res.render('admin/episodes/edit',
        {episode, courses});
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      let status = await this.validationData(req);

      if (!status) {
        return this.back(req, res);
      }

      let episode = await Episode.findByIdAndUpdate(req.params.id, {
        $set: {
          ...req.body
        }
      });

      // update prev course time
      await this.updateCourseTime(episode.course);
      // update current course time
      await this.updateCourseTime(req.body.course);

      return res.redirect('/admin/episodes');
    } catch (err) {
      next(err);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let episode = await Episode.findById(req.params.id);

      if (!episode) {
        this.error('چنین ویدیویی وجود ندارد!', 404);
      }

      let courseId = episode.course;

      // delete episode
      episode.remove();

      // update course time
      await this.updateCourseTime(courseId);

      return res.redirect('/admin/episodes');
    } catch (err) {
      next(err);
    }
  }

  async updateCourseTime(courseID) {
    let course = await Course.findById(courseID)
      .populate('episodes').exec();

    course.set({
      time: this.getTime(course.episodes)
    });
    await course.save();
  }
}

module.exports = new EpisodeController();