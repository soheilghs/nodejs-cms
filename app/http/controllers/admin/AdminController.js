const Controller = require('app/http/controllers/Controller');

class AdminController extends Controller {
  index(req, res) {
    res.render('admin/index');
  }

  uploadImage(req, res) {
    let image = req.file;
    res.json({
      "uploaded": 1,
      "fileName": image.originalname,
      "url": `${image.destination}/${image.filename}`.substring(8)
    });
  }
}

module.exports = new AdminController();