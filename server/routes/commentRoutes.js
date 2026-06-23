import express from 'express';
import {
  getComments,
  createComment,
  deleteComment
} from '../controllers/commentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:taskId', authMiddleware, getComments);
router.post('/:taskId', authMiddleware, createComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;
