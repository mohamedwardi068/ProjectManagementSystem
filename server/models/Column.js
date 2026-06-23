import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  board_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  order_index: {
    type: Number,
    required: true,
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Column = mongoose.model('Column', columnSchema);

export default Column;
