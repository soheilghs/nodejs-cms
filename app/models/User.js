const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const uniqueString = require('unique-string');
const mongoosePaginate =
  require('mongoose-paginate');
//const Learning = require('app/models/Learning');

const userSchema = Schema({
  name: {type: String, required: true},
  admin: {type: Boolean, default: 0},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  learning: [{type: Schema.Types.ObjectId, ref: 'Course'}],
  roles: [{type: Schema.Types.ObjectId, ref: 'Role'}],
  rememberToken: {type: String, default: 'month'},
  vipTime: {type: Date, default: new Date().toISOString()},
  vipType: {type: String, default: null},
}, {
    timestamps: true,
    toJSON: {virtuals: true}
});

userSchema.pre('save', function (next) {
  let salt = bcrypt.genSaltSync(15);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  let salt = bcrypt.genSaltSync(15);
  let password = this.getUpdate().$set.password;
  this.getUpdate().$set.password = bcrypt.hashSync(password, salt);
  next();
});

userSchema.plugin(mongoosePaginate);

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.hasRole = function (roles) {
  let result = roles.filter(role => {
    return this.roles.indexOf(role) > -1;
  });

  return !! result.length;
};

userSchema.methods.setRememberToken = function (res) {
  const token = uniqueString();
  res.cookie('remember_token', token, {
    maxAge: 1000 * 60 * 60 * 24 * 90,
    httpOnly: true,
    signed: true
  });
  this.update({
    rememberToken: token
  }, err => {
    if (err) {
      console.log(err);
    }
  });
}

userSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'user'
});

userSchema.methods.isVip = function () {
  return new Date(this.vipTime) >= new Date();
}

userSchema.methods.checkLearning =
  function (courseID) {
  return this.learning.indexOf(courseID) !== -1;

  /*return !! await Learning.findOne({
    user: this.id,
    course: course.id
  });*/
}

module.exports = mongoose.model('User', userSchema);