const Controller = require('app/http/controllers/Controller');
const Comment = require('app/models/Comment');

class CommentController extends Controller {

  async index(req, res, next) {
    try {
      let page = req.query.page || 1;

      let comments = await Comment.paginate({
        approved: true
      }, this.queryOptions(page));

      res.render('admin/comments/index', {
        title: 'نظرات',
        comments
      });
    } catch (err) {
      next(err);
    }
  }

  async approved(req, res, next) {
    try {
      let page = req.query.page || 1;

      let comments = await Comment.paginate({
        approved: false
      }, this.queryOptions(page));

      res.render('admin/comments/approved', {
        title: 'نظرات تایید نشده',
        comments
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let comment = await Comment.findById(req.params.id)
        .populate('belongTo').exec();

      if (!comment) {
        this.error('چنین نظری وجود ندارد!', 404);
      }

      await comment.belongTo.inc('commentCount');

      comment.approved = true;
      await comment.save();

      return this.back(req, res);
    } catch (err) {
      next(err);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let comment = await Comment.findById(req.params.id)
        .exec();

      if (!comment) {
        this.error('چنین نظری وجود ندارد!', 404);
      }

      // delete course
      comment.remove();

      return this.back(req, res);
    } catch (err) {
      next(err);
    }
  }

  queryOptions(page) {
    return {
      page,
      sort: {createdAt: -1},
      limit: 2,
      populate: [
        {
          path: 'user',
          select: 'name'
        },
        'course',
        {
          path: 'episode',
          populate: [
            {
              path: 'course',
              select: 'slug'
            }
          ]
        }
      ]
    };
  }
}

module.exports = new CommentController();