const Controller = require('app/http/controllers/Controller');
const Permission = require('app/models/Permission');

class PermissionController extends Controller {

  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let permissions = await Permission.paginate({}, {
        page,
        sort: {createdAt: -1},
        limit: 5
      });

      res.render('admin/permissions/index', {
        title: 'لیست اجازه دسترسی',
        permissions
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res) {
    res.render('admin/permissions/create');
  }

  async store(req, res, next) {
    try {
      let status = await this.validationData(req);

      if (!status) {
        return this.back(req, res);
      }

      let {name, label} = req.body;

      let newPermission =
        new Permission({
          name, label
        });
      await newPermission.save();

      return res.redirect('/admin/users/permissions');
    } catch (err) {
      next(err);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let permission = await Permission.findById(req.params.id);

      if (!permission) {
        this.error('چنین اجازه دسترسی وجود ندارد!', 404);
      }

      return res.render('admin/permissions/edit',
        {permission});
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

      let {name, label} = req.body;

      await Permission.findByIdAndUpdate(req.params.id, {
        $set: {
          name, label
        }
      });

      return res.redirect('/admin/users/permissions');
    } catch (err) {
      next(err);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let permission =
        await Permission.findById(req.params.id)
          .exec();

      if (!permission) {
        this.error('چنین اجازه دسترسی وجود ندارد!', 404);
      }

      // delete category
      permission.remove();

      return res.redirect('/admin/users/permissions');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PermissionController();