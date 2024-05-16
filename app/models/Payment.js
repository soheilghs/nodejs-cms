const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const PaymentSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  vip: {type: Boolean, default: false},
  res_number: {type: String, required: true},
  price: {type: Number, required: true},
  payed: {type: Boolean, default: false},
}, {
  timestamps: true,
  toJSON: {virtuals: true}
});

PaymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment', PaymentSchema);