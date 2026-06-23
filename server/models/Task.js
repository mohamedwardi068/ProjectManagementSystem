import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  board_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  column_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Column',
    required: true,
  },
  priority: {
    type: String,
    default: 'medium',
  },
  labels: [{
    type: String,
  }],
  due_date: {
    type: Date,
    default: null,
  },
  assigned_to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
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

const Task = mongoose.model('Task', taskSchema);

export default Task;
