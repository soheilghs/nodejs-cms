const Controller = require('app/http/controllers/Controller');
const Course = require('app/models/Course');
const Category = require('app/models/Category');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class CourseController extends Controller {

  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let courses = await Course.paginate({}, {
        page,
        sort: {createdAt: -1},
        limit: 4
      });

      res.render('admin/courses/index', {
        title: 'دوره ها',
        courses
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res) {
    let categories = await Category.find({});
    res.render('admin/courses/create', {categories});
  }

  async store(req, res, next) {
    try {
      let status = await this.validationData(req);

      if (!status) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return this.back(req, res);
      }

      // create course
      let images = this.imageResize(req.file);
      let {title, body, type, price, tags, lang} = req.body;

      let newCourse = new Course({
        user: req.user._id,
        title,
        slug: this.slug(title),
        body, type, price,
        images,
        thumb: images[480],
        tags,
        lang
      });

      await newCourse.save();
      return res.redirect('/admin/courses');
    } catch (err) {
      next(err);
    }
  }

  imageResize(image) {
    const imageInfo = path.parse(image.path);
    let addressImages = {};
    addressImages['original'] =
      this.getUrlImage(`${image.destination}/${image.filename}`);

    const resize = size => {
      let imageName = `${imageInfo.name}-${size}${imageInfo.ext}`;
      addressImages[size] =
        this.getUrlImage(`${image.destination}/${imageName}`);
      sharp(image.path)
        .resize(size, null)
        .toFile(`${image.destination}/${imageName}`);
    };

    [1080, 720, 480].map(resize);

    return addressImages;
  }

  getUrlImage(dir) {
    return dir.substring(8);
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let course = await Course.findById(req.params.id);

      if (!course) {
        this.error('چنین دوره ای وجود ندارد!', 404);
      }

      req.courseUserId = course.user;
      if (!req.userCan('edit-courses')) {
        this.error('شما اجازه دسترسی به این صفحه را ندارید', 403);
      }

      let categories = await Category.find({});
      return res.render('admin/courses/edit',
        {course, categories});
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      let status = await this.validationData(req);

      if (!status) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return this.back(req, res);
      }

      let objForUpdate = {};

      // set image thumb
      objForUpdate.thumb = req.body.imagesThumb;

      // check image
      if (req.file) {
        objForUpdate.images = this.imageResize(req.file);
        objForUpdate.thumb = objForUpdate.images[480];
        let course = await Course.findById(req.params.id);
        Object.values(course.images)
          .forEach(image => fs.unlinkSync(`./public${image}`));
      }

      delete req.body.images;
      objForUpdate.slug = this.slug(req.body.title);

      await Course.findByIdAndUpdate(req.params.id, {
        $set: {
          ...req.body,
          ...objForUpdate
        }
      });

      return res.redirect('/admin/courses');
    } catch (err) {
      next(err);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let course = await Course.findById(req.params.id)
        .populate('episodes').exec();

      if (!course) {
        this.error('چنین دوره ای وجود ندارد!', 404);
      }

      // delete episodes
      course.episodes.forEach(episode => episode.remove());
      // delete Images
      Object.values(course.images)
        .forEach(image => fs.unlinkSync(`./public${image}`));

      // delete course
      course.remove();

      return res.redirect('/admin/courses');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CourseController();