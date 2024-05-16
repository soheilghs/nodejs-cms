const Controller = require('app/http/controllers/Controller');
const User = require('app/models/User');
const Role = require('app/models/Role');

class UserController extends Controller {

  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let users = await User.paginate({}, {
        page,
        sort: {createdAt: -1},
        limit: 10
      });

      res.render('admin/users/index', {
        title: 'کاربران',
        users
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res) {
    res.render('admin/users/create');
  }

  async addRole(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let user = await User.findById(req.params.id);

      if (!user) {
        this.error('چنین کاربری وجود ندارد!', 404);
      }

      let roles =
        await Role.find({});

      res.render('admin/users/add_role',
        {user, roles});
    } catch (err) {
      next(err);
    }
  }

  async storeRoleForUser(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let user = await User.findById(req.params.id);

      if (!user) {
        this.error('چنین کاربری وجود ندارد!', 404);
      }

      user.set({roles: req.body.roles});
      await user.save();

      res.redirect('/admin/users');
    } catch (err) {
      next(err);
    }
  }

  async store(req, res, next) {
    try {
      let status = await this.validationData(req);

      if (!status) {
        return this.back(req, res);
      }

      let {name, email, password} = req.body;

      let newUser =
        new User({
          name, email, password
        });

      await newUser.save();

      return res.redirect('/admin/users');
    } catch (err) {
      next(err);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let user = await User.findById(req.params.id);

      if (!user) {
        this.error('چنین کاربری وجود ندارد!', 404);
      }

      return res.render('admin/users/edit',
        {user});
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

      let {name} = req.body;

      await User.findByIdAndUpdate(req.params.id, {
        $set: {
          name
        }
      });

      return res.redirect('/admin/users');
    } catch (err) {
      next(err);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let user = await User.findById(req.params.id)
        .populate({
          path: 'courses',
          populate: ['episodes']
        }).exec();

      if (!user) {
        this.error('چنین کاربری وجود ندارد!', 404);
      }

      user.courses.forEach(course => {
        course.episodes.forEach(episode => episode.remove());
        course.remove();
      });

      // delete user
      user.remove();

      return res.redirect('/admin/users');
    } catch (err) {
      next(err);
    }
  }

  async toggleAdmin(req, res, next) {
    try {
      this.isMongoId(req.params.id);

      let user = await User.findById(req.params.id);
      user.set({
        admin: !user.admin
      });
      await user.save();

      return this.back(req, res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();