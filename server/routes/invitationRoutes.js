import express from 'express';
import {
  getUserInvitations,
  acceptInvitation,
  declineInvitation
} from '../controllers/invitationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getUserInvitations);
router.post('/:id/accept', authMiddleware, acceptInvitation);
router.post('/:id/decline', authMiddleware, declineInvitation);

export default router;
