import Invitation from '../models/Invitation.js';
import Board from '../models/Board.js';

export const getUserInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ receiver_id: req.user.id, status: 'pending' })
      .populate('board_id', 'title description')
      .populate('sender_id', 'name email avatar')
      .sort({ created_at: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Get user invitations error:', error);
    res.status(500).json({ message: 'Server error fetching invitations' });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation || invitation.receiver_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation is no longer pending' });
    }

    // Add user to board
    const board = await Board.findById(invitation.board_id);
    if (board) {
      const members = board.members || [];
      if (!members.includes(req.user.id)) {
        members.push(req.user.id);
        await Board.findByIdAndUpdate(invitation.board_id, { members });
      }
    }

    invitation.status = 'accepted';
    await invitation.save();

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error accepting invitation' });
  }
};

export const declineInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation || invitation.receiver_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation is no longer pending' });
    }

    invitation.status = 'declined';
    await invitation.save();

    res.json({ message: 'Invitation declined successfully' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ message: 'Server error declining invitation' });
  }
};

export default { getUserInvitations, acceptInvitation, declineInvitation };
