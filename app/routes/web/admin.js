const express = require('express');
const router = express.Router();

// Validators
const CourseValidator =
  require('app/http/validators/CourseValidator');
const EpisodeValidator =
  require('app/http/validators/EpisodeValidator');
const CategoryValidator =
  require('app/http/validators/CategoryValidator');
const RegisterValidator =
  require('app/http/validators/RegisterValidator');
const PermissionValidator =
  require('app/http/validators/PermissionValidator');
const RoleValidator =
  require('app/http/validators/RoleValidator');

// Helpers
const upload = require('app/helpers/UploadImage');
const gate = require('app/helpers/gate');

// Middlewares
const convertFileToField =
  require('app/http/middleware/convertFileToField');

// Controllers
const AdminController =
  require('app/http/controllers/admin/AdminController');
const CourseController =
  require('app/http/controllers/admin/CourseController');
const EpisodeController =
  require('app/http/controllers/admin/EpisodeController');
const CommentController =
  require('app/http/controllers/admin/CommentController');
const CategoryController =
  require('app/http/controllers/admin/CategoryController');
const UserController =
  require('app/http/controllers/admin/UserController');
const PermissionController =
  require('app/http/controllers/admin/PermissionController');
const RoleController =
  require('app/http/controllers/admin/RoleController');

router.use((req,
            res,
            next) => {
  res.locals.layout = "admin/master";
  next();
});

//Admin Routes
router.get('/', AdminController.index);

// Course Routes
router.get('/courses', gate.can('show-courses'),
  CourseController.index);
router.get('/courses/create', CourseController.create);
router.post('/courses/create',
  upload.single('images'),
  convertFileToField.handle,
  CourseValidator.handle(),
  CourseController.store);
router.get('/courses/:id/edit', CourseController.edit);
router.put('/courses/:id',
  upload.single('images'),
  convertFileToField.handle,
  CourseValidator.handle(),
  CourseController.update);
router.delete('/courses/:id', CourseController.destroy);

// Permission Routes
router.get('/users/permissions', PermissionController.index);
router.get('/users/permissions/create', PermissionController.create);
router.post('/users/permissions/create',
  PermissionValidator.handle(),
  PermissionController.store);
router.get('/users/permissions/:id/edit', PermissionController.edit);
router.put('/users/permissions/:id',
  PermissionValidator.handle(),
  PermissionController.update);
router.delete('/users/permissions/:id', PermissionController.destroy);

// Role Routes
router.get('/users/roles', RoleController.index);
router.get('/users/roles/create', RoleController.create);
router.post('/users/roles/create',
  RoleValidator.handle(),
  RoleController.store);
router.get('/users/roles/:id/edit', RoleController.edit);
router.put('/users/roles/:id',
  RoleValidator.handle(),
  RoleController.update);
router.delete('/users/roles/:id', RoleController.destroy);

// Episode Routes
router.get('/episodes', EpisodeController.index);
router.get('/episodes/create', EpisodeController.create);
router.post('/episodes/create',
  EpisodeValidator.handle(),
  EpisodeController.store);
router.get('/episodes/:id/edit', EpisodeController.edit);
router.put('/episodes/:id',
  EpisodeValidator.handle(),
  EpisodeController.update);
router.delete('/episodes/:id', EpisodeController.destroy);

// Category Routes
router.get('/categories', CategoryController.index);
router.get('/categories/create', CategoryController.create);
router.post('/categories/create',
  CategoryValidator.handle(),
  CategoryController.store);
router.get('/categories/:id/edit', CategoryController.edit);
router.put('/categories/:id',
  CategoryValidator.handle(),
  CategoryController.update);
router.delete('/categories/:id', CategoryController.destroy);

// Comment Routes
router.get('/comments/approved',
  gate.can('show-approved-comments'),
  CommentController.approved);
router.get('/comments',
  gate.can('show-comments'),
  CommentController.index);
router.delete('/comments/:id', CommentController.destroy);
router.put('/comments/:id/approved', CommentController.update);

router.post('/upload-image',
  upload.single('upload'),
  AdminController.uploadImage);

// User Routes
router.get('/users', UserController.index);
router.delete('/users/:id', UserController.destroy);
router.get('/users/:id/toggle_admin', UserController.toggleAdmin);
router.get('/users/create', UserController.create);
router.post('/users',
  RegisterValidator.handle(),
  UserController.store);
router.get('/users/:id/add_role', UserController.addRole);
router.put('/users/:id/add_role', UserController.storeRoleForUser);

module.exports = router;