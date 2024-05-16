let ConnectRoles = require('connect-roles');
let Permission = require('app/models/Permission');

let gate = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    let accept = req.headers.accept || '';

    //res.locals.layout = "errors/master";

    res.status(403);
    if (accept.indexOf('html')) {
      res.render('errors/403', {action});
    } else {
      res.json('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

const permissions = async () => {
  return await Permission.find({})
    .populate('roles').exec();
}

permissions()
  .then(permissions => {
    permissions.forEach(permission => {
      let roles = permission.roles.map(item => item._id);
      gate.use(permission.name, (req) => {
        return (req.isAuthenticated()) ? req.user.hasRole(roles)
          : false;
      });
    });
  });

module.exports = gate;