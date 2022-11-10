import express from 'express';
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
  toggleDislikePost,
  toggleLikePost,
  updatePost,
} from '../controllers/post-controller';
import { deserializeUser } from '../middlewares/deserialize-user';
import { requireAuth } from '../middlewares/require-auth';
import { validate } from '../middlewares/validate';
import {
  newPostInputSchema,
  updatePostInputSchema,
} from '../schemas/post-schema';

const router = express.Router();

// Public routes
router.route('/').get(getAllPosts);
router.route('/:postId').get(getSinglePost);

// User routes
router.use(deserializeUser, requireAuth);
router.post('/', validate(newPostInputSchema), createPost);
router.patch('/:postId', validate(updatePostInputSchema), updatePost);
router.delete('/:postId', deletePost);
router.route('/:postId/toggle-like').put(toggleLikePost);
router.route('/:postId/toggle-dislike').put(toggleDislikePost);

export default router;
