import Task from '../models/Task.js';
import Board from '../models/Board.js';
import Column from '../models/Column.js';

const checkBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return null;
  if (board.owner_id.toString() !== userId && !board.members?.some(m => m.toString() === userId)) {
    return null;
  }
  return board;
};

export const getTasks = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await checkBoardAccess(boardId, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ board_id: boardId }).sort({ order_index: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await checkBoardAccess(task.board_id, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { column_id, title, description, priority, labels, due_date, assigned_to } = req.body;

    if (!title || !column_id) {
      return res.status(400).json({ message: 'Title and column are required' });
    }

    const board = await checkBoardAccess(boardId, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const columnTasks = await Task.find({ column_id: column_id });
    const orderIndex = columnTasks.length;

    const task = await Task.create({
      board_id: boardId,
      column_id,
      title,
      description: description || '',
      priority: priority || 'medium',
      labels: labels || [],
      due_date: due_date || null,
      assigned_to: assigned_to || [],
      order_index: orderIndex
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, labels, due_date, assigned_to, column_id, order_index } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await checkBoardAccess(task.board_id, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (labels !== undefined) updates.labels = labels;
    if (due_date !== undefined) updates.due_date = due_date;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (column_id !== undefined) updates.column_id = column_id;
    if (order_index !== undefined) updates.order_index = order_index;

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await checkBoardAccess(task.board_id, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

export const moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { column_id, order_index } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await checkBoardAccess(task.board_id, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, { column_id, order_index }, { new: true });
    res.json(updatedTask);
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: 'Server error moving task' });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { tasks } = req.body;

    const board = await checkBoardAccess(boardId, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bulkOps = tasks.map(task => ({
      updateOne: {
        filter: { _id: task.id },
        update: { column_id: task.column_id, order_index: task.order_index }
      }
    }));
    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ message: 'Server error reordering tasks' });
  }
};

export const searchTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { q } = req.query;

    const board = await checkBoardAccess(boardId, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ 
      board_id: boardId, 
      title: { $regex: q || '', $options: 'i' } 
    }).sort({ order_index: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({ message: 'Server error searching tasks' });
  }
};

export const filterTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { priority, column } = req.query;

    const board = await checkBoardAccess(boardId, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { board_id: boardId };
    if (priority) query.priority = priority;
    if (column) query.column_id = column;

    const tasks = await Task.find(query).sort({ order_index: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Filter tasks error:', error);
    res.status(500).json({ message: 'Server error filtering tasks' });
  }
};

export const getAllUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all boards where the user is the owner or a member
    const boards = await Board.find({
      $or: [{ owner_id: userId }, { members: userId }],
    });

    const boardIds = boards.map((b) => b._id);

    // Find all tasks that belong to those boards
    const tasks = await Task.find({ board_id: { $in: boardIds } });
    
    // Find all columns for those boards
    const columns = await Column.find({ board_id: { $in: boardIds } });

    // Add board titles and column titles to the tasks for context in the calendar/dashboard
    const enhancedTasks = tasks.map((task) => {
      const board = boards.find((b) => b._id.toString() === task.board_id.toString());
      const column = columns.find((c) => c._id.toString() === task.column_id.toString());
      return {
        ...task.toObject(),
        board_title: board ? board.title : 'Unknown Board',
        column_title: column ? column.title : 'Unknown Column',
      };
    });

    res.json(enhancedTasks);
  } catch (error) {
    console.error('Get all user tasks error:', error);
    res.status(500).json({ message: 'Server error fetching all user tasks' });
  }
};

export default { getTasks, getTask, createTask, updateTask, deleteTask, moveTask, reorderTasks, searchTasks, filterTasks, getAllUserTasks };
