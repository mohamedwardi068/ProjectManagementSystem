import express from 'express';
import {
  getBoards,
  searchBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  inviteMember,
  removeMember,
  joinBoard
} from '../controllers/boardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getBoards);
router.get('/search', authMiddleware, searchBoards);
router.get('/:id', authMiddleware, getBoard);
router.post('/', authMiddleware, createBoard);
router.put('/:id', authMiddleware, updateBoard);
router.delete('/:id', authMiddleware, deleteBoard);
router.post('/:id/invites', authMiddleware, inviteMember);
router.delete('/:id/members/:userId', authMiddleware, removeMember);
router.post('/:id/join', authMiddleware, joinBoard);

export default router;
