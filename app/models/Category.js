const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate =
  require('mongoose-paginate');

const CategorySchema = Schema({
  name: {type: String, required: true},
  slug: {type: String, required: true},
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
}, {
  timestamps: true,
  toJSON: {virtuals: true}
});

CategorySchema.plugin(mongoosePaginate);

CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

module.exports = mongoose.model('Category', CategorySchema);