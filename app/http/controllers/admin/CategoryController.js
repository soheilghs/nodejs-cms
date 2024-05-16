const Controller = require('app/http/controllers/Controller');
const Category = require('app/models/Category');

class CategoryController extends Controller {

  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let categories = await Category.paginate({}, {
        page,
        sort: {createdAt: -1},
        limit: 5,
        populate: 'parent'
      });

      res.render('admin/categories/index', {
        title: 'دسته ها',
        categories
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res) {
    let categories = await Category.find({parent: null});
    res.render('admin/categories/create', {categories});
  }

  async store(req, res, next) {
    try {
      let status = await this.validationData(req);

      if (!status) {
        return this.back(req, res);
      }

      let {name, parent} = req.body;

      let newCat =
        new Category({
          name,
          slug: this.slug(name),
          parent: parent !== 'none' ? parent : null
        });
      await newCat.save();

      return res.redirect('/admin/categories');
    } catch (err) {
      next(err);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let cat = await Category.findById(req.params.id);

      if (!cat) {
        this.error('چنین دسته ای وجود ندارد!', 404);
      }

      let categories = await Category.find({
        parent: null,
        _id: {$ne: req.params.id}
      });

      return res.render('admin/categories/edit',
        {cat, categories});
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

      let {name, parent} = req.body;

      await Category.findByIdAndUpdate(req.params.id, {
        $set: {
          name,
          slug: this.slug(name),
          parent: parent !== 'none' ? parent : null
        }
      });

      return res.redirect('/admin/categories');
    } catch (err) {
      next(err);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let category = await Category.findById(req.params.id)
        .populate('children').exec();

      if (!category) {
        this.error('چنین دسته ای وجود ندارد!', 404);
      }

      category.children.forEach(cat => cat.remove());

      // delete category
      category.remove();

      return res.redirect('/admin/categories');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();