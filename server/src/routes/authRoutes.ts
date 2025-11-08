import express from 'express';
import { register, login, getMe, addCategory, deleteCategory, getCategories } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/categories', protect, getCategories);
router.post('/categories', protect, addCategory);
router.delete('/categories/:category', protect, deleteCategory);

export default router;
