import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Board from '../models/Board.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const checkTaskAccess = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const board = await Board.findById(task.board_id);
  if (!board) return null;

  if (board.owner_id.toString() !== userId && !board.members?.some(m => m.toString() === userId)) {
    return null;
  }

  return task;
};

export const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await checkTaskAccess(taskId, req.user.id);
    if (!task) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comments = await Comment.find({ task_id: taskId }).sort({ created_at: 1 });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await checkTaskAccess(taskId, req.user.id);
    if (!task) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await Comment.create({
      task_id: taskId,
      author_id: req.user.id,
      text: text.trim()
    });

    const board = await Board.findById(task.board_id);
    if (board && board.owner_id.toString() !== req.user.id) {
      const commenter = await User.findById(req.user.id);
      await Notification.create({
        user_id: board.owner_id,
        type: 'comment',
        message: `${commenter?.name || 'A user'} commented on a task in your board "${board.title}"`,
        related_board_id: board._id
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only author can delete comment' });
    }

    await Comment.findByIdAndDelete(id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};

export default { getComments, createComment, deleteComment };
