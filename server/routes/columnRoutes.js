import express from 'express';
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns
} from '../controllers/columnController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:boardId', authMiddleware, getColumns);
router.post('/:boardId', authMiddleware, createColumn);
router.put('/:id', authMiddleware, updateColumn);
router.delete('/:id', authMiddleware, deleteColumn);
router.post('/reorder/:boardId', authMiddleware, reorderColumns);

export default router;
