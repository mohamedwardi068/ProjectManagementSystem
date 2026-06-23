import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Invitation from '../models/Invitation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const DEFAULT_COLUMNS = [
  { title: 'To Do', order_index: 0 },
  { title: 'In Progress', order_index: 1 },
  { title: 'Review', order_index: 2 },
  { title: 'Done', order_index: 3 }
];

export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner_id: req.user.id }, { members: req.user.id }]
    })
      .populate('owner_id', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ created_at: -1 });
    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error fetching boards' });
  }
};

export const searchBoards = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.json([]);
    }

    const boards = await Board.find({
      title: { $regex: name, $options: 'i' },
      owner_id: { $ne: req.user.id },
      members: { $ne: req.user.id }
    })
      .populate('owner_id', 'name')
      .limit(10);
      
    res.json(boards);
  } catch (error) {
    console.error('Search boards error:', error);
    res.status(500).json({ message: 'Server error searching boards' });
  }
};

export const getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id)
      .populate('owner_id', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner_id._id.toString() !== req.user.id && !board.members?.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const columns = await Column.find({ board_id: board.id }).sort({ order_index: 1 });

    res.json({ ...board.toJSON(), columns });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error fetching board' });
  }
};

export const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    const board = await Board.create({
      title,
      description: description || '',
      owner_id: req.user.id,
      members: []
    });

    const columnsData = DEFAULT_COLUMNS.map(col => ({
      board_id: board.id,
      title: col.title,
      order_index: col.order_index
    }));

    const columns = await Column.insertMany(columnsData);

    res.status(201).json({ ...board.toJSON(), columns });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error creating board' });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, members } = req.body;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can update board' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (members !== undefined) updates.members = members;
    const updatedBoard = await Board.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedBoard);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error updating board' });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can delete board' });
    }
    await Board.findByIdAndDelete(id);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error deleting board' });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can invite members' });
    }

    if (board.owner_id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot invite the board owner' });
    }

    const members = board.members || [];
    const isMember = members.some(m => m.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Check if pending invitation exists
    const existingInvite = await Invitation.findOne({ board_id: id, receiver_id: userId, status: 'pending' });
    if (existingInvite) {
      return res.status(400).json({ message: 'Invitation is already pending' });
    }

    const invitation = await Invitation.create({
      board_id: id,
      sender_id: req.user.id,
      receiver_id: userId,
      status: 'pending'
    });

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ message: 'Server error inviting member' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    const members = (board.members || []).filter(m => m.toString() !== userId);
    const updatedBoard = await Board.findByIdAndUpdate(id, { members }, { new: true });
    res.json(updatedBoard);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
};

export const joinBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner_id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You are the owner of this board' });
    }

    const members = board.members || [];
    if (!members.includes(req.user.id)) {
      members.push(req.user.id);
      const updatedBoard = await Board.findByIdAndUpdate(id, { members }, { new: true });
      
      const user = await User.findById(req.user.id);
      await Notification.create({
        user_id: board.owner_id,
        type: 'join',
        message: `${user?.name || 'A user'} joined your board "${board.title}"`,
        related_board_id: board._id
      });
      
      return res.json(updatedBoard);
    }
    
    res.status(400).json({ message: 'You are already a member of this board' });
  } catch (error) {
    console.error('Join board error:', error);
    res.status(500).json({ message: 'Server error joining board' });
  }
};

export const closeBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (board.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can close this board' });
    }
    board.status = 'closed';
    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Close board error:', error);
    res.status(500).json({ message: 'Server error closing board' });
  }
};

export default { getBoards, searchBoards, getBoard, createBoard, updateBoard, deleteBoard, inviteMember, removeMember, joinBoard, closeBoard };
