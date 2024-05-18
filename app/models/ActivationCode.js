const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activationCode = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {type: String, required: true},
  used: {type: Boolean, default: false},
  expire: {type: Date, required: true}
}, {timestamps: true});

module.exports = mongoose.model('ActivationCode', activationCode);