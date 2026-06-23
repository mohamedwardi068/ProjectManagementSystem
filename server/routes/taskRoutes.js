import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
  searchTasks,
  filterTasks,
  getAllUserTasks
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all/user', authMiddleware, getAllUserTasks);
router.get('/:boardId', authMiddleware, getTasks);
router.get('/task/:id', authMiddleware, getTask);
router.post('/:boardId', authMiddleware, createTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
router.post('/move/:id', authMiddleware, moveTask);
router.post('/reorder/:boardId', authMiddleware, reorderTasks);
router.get('/search/:boardId', authMiddleware, searchTasks);
router.get('/filter/:boardId', authMiddleware, filterTasks);

export default router;
