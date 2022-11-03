import express from 'express';
import { getAllUsers, getCurrentUser } from '../controllers/user-controller';
import { deserializeUser } from '../middlewares/deserialize-user';
import { requireAuth } from '../middlewares/require-auth';
import { restrictTo } from '../middlewares/restrict-role';

const router = express.Router();

router.use(deserializeUser, requireAuth);

router.get('/', restrictTo('admin'), getAllUsers);

router.get('/me', getCurrentUser);

export default router;
