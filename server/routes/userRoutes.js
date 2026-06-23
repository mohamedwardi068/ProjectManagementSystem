import express from 'express';
import {
  getAllUsers,
  getUserProfile,
  updateProfile,
  changePassword
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);

export default router;
