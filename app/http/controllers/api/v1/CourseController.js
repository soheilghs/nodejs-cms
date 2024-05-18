const Controller =
  require('app/http/controllers/api/Controller');
const Course = require('app/models/Course');
const Comment = require('app/models/Comment');
const passport = require('passport');

class CourseController extends Controller {

  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let courses = await Course.paginate({}, {
        select: {
          "__v": 0
        },
        page,
        sort: {createdAt: -1},
        limit: 6,
        populate: [
          {
            path: 'categories'
          },
          {
            path: 'user'
          }
        ]
      });

      res.json({
        data: this.filterCoursesData(courses),
        status: 'success'
      });
    } catch (err) {
      this.failed(err.message, res)
    }
  }

  filterCoursesData(courses) {
    return {
      ...courses,
      docs: courses.docs.map(course => {
        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          body: course.body,
          image: course.thumb,
          categories: course.categories.map(cat => {
            return {
              name: cat.name,
              slug: cat.slug
            }
          }),
          user: {
            id: course.user.id,
            name: course.user.name
          },
          price: course.price,
          createdAt: course.createdAt
        }
      })
    };
  }

  async single(req, res) {
    try {
      let course =
        await Course.findByIdAndUpdate(req.params.course,
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
              },
            },
            {
              path: 'categories',
              select: 'name slug'
            }
          ]);

      if (!course) {
        return this.failed(
          'چنین دوره ای یافت نشد',
          res, 404);
      }

      passport.authenticate('jwt',
        {session: false},
        (err, user, info) => {
          res.json({
            data: this.filterCourseData(course, user),
            status: 'success'
          });
        })(req, res);
    } catch (err) {
      this.failed(err.message, res)
    }
  }

  filterCourseData(course, user) {
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      body: course.body,
      image: course.thumb,
      categories: course.categories.map(cat => {
        return {
          name: cat.name,
          slug: cat.slug
        }
      }),
      user: {
        id: course.user.id,
        name: course.user.name
      },
      price: course.price,
      episodes: course.episodes.map(episode => {
        return {
          time: episode.time,
          downloadCount: episode.downloadCount,
          viewCount: episode.viewCount,
          commentCount: episode.commentCount,
          id: episode.id,
          title: episode.title,
          body: episode.body,
          type: episode.type,
          number: episode.number,
          createdAt: episode.createdAt,
          download: episode.download(!!user, user)
        }
      }),
      createdAt: course.createdAt
    };
  }

  async getComments(req, res) {
    try {
      let comments =
        await Comment.find({
          course: req.params.course,
          parent: null,
          approved: true
        }).populate([
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
        ]);

      return res.json(comments);
    } catch (err) {
      this.failed(err.message, res);
    }
  }
}

module.exports = new CourseController();