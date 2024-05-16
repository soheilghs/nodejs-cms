const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const LearningSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
}, {
  timestamps: true
  /*toJSON: {virtuals: true}*/
});

LearningSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Learning', LearningSchema);