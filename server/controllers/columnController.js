import Column from '../models/Column.js';
import Board from '../models/Board.js';

const checkBoardAccess = async (boardId, userId, checkClosed = false) => {
  const board = await Board.findById(boardId);
  if (!board) return null;
  if (board.owner_id.toString() !== userId && !board.members?.some(m => m.toString() === userId)) {
    return null;
  }
  if (checkClosed && board.status === 'closed') {
    return 'closed';
  }
  return board;
};

export const getColumns = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await checkBoardAccess(boardId, req.user.id);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const columns = await Column.find({ board_id: boardId }).sort({ order_index: 1 });
    res.json(columns);
  } catch (error) {
    console.error('Get columns error:', error);
    res.status(500).json({ message: 'Server error fetching columns' });
  }
};

export const createColumn = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    const board = await checkBoardAccess(boardId, req.user.id, true);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (board === 'closed') {
      return res.status(400).json({ message: 'Cannot modify a closed board' });
    }

    const existingColumns = await Column.find({ board_id: boardId });
    const orderIndex = existingColumns.length;

    const column = await Column.create({
      board_id: boardId,
      title,
      order_index: orderIndex
    });

    res.status(201).json(column);
  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({ message: 'Server error creating column' });
  }
};

export const updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, orderIndex } = req.body;

    const column = await Column.findById(id);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const board = await checkBoardAccess(column.board_id, req.user.id, true);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (board === 'closed') {
      return res.status(400).json({ message: 'Cannot modify a closed board' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (orderIndex !== undefined) updates.order_index = orderIndex;

    const updatedColumn = await Column.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedColumn);
  } catch (error) {
    console.error('Update column error:', error);
    res.status(500).json({ message: 'Server error updating column' });
  }
};

export const deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;

    const column = await Column.findById(id);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const board = await Board.findById(column.board_id);
    if (!board || board.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can delete columns' });
    }
    if (board.status === 'closed') {
      return res.status(400).json({ message: 'Cannot modify a closed board' });
    }

    await Column.findByIdAndDelete(id);
    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({ message: 'Server error deleting column' });
  }
};

export const reorderColumns = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { columns } = req.body;

    const board = await checkBoardAccess(boardId, req.user.id, true);
    if (!board) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (board === 'closed') {
      return res.status(400).json({ message: 'Cannot modify a closed board' });
    }

    const bulkOps = columns.map(col => ({
      updateOne: {
        filter: { _id: col.id },
        update: { order_index: col.order_index }
      }
    }));
    if (bulkOps.length > 0) {
      await Column.bulkWrite(bulkOps);
    }
    res.json({ message: 'Columns reordered successfully' });
  } catch (error) {
    console.error('Reorder columns error:', error);
    res.status(500).json({ message: 'Server error reordering columns' });
  }
};

export default { getColumns, createColumn, updateColumn, deleteColumn, reorderColumns };
