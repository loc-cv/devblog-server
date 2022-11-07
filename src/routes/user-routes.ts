import express from 'express';
import { getAllUsers, getCurrentUser } from '../controllers/user-controller';
import { deserializeUser } from '../middlewares/deserialize-user';
import { requireAuth } from '../middlewares/require-auth';
import { restrictTo } from '../middlewares/restrict-to';

const router = express.Router();

// User routes
router.use(deserializeUser, requireAuth);
router.get('/me', getCurrentUser);

// Admin routes
router.get('/', restrictTo('admin'), getAllUsers);

export default router;
