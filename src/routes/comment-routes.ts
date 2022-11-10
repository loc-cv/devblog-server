import express from 'express';
import {
  createComment,
  deleteComment,
  getAllComments,
  getSingleComment,
  updateComment,
} from '../controllers/comment-controller';
import { deserializeUser } from '../middlewares/deserialize-user';
import { requireAuth } from '../middlewares/require-auth';
import { validate } from '../middlewares/validate';
import {
  newCommentInputSchema,
  updateCommentInputSchema,
} from '../schemas/comment-schema';

const router = express.Router();

// Public routes
router.route('/').get(getAllComments);
router.route('/:commentId').get(getSingleComment);

// User routes
router.use(deserializeUser, requireAuth);
router.post('/', validate(newCommentInputSchema), createComment);
router.patch('/:commentId', validate(updateCommentInputSchema), updateComment);
router.delete('/:commentId', deleteComment);

export default router;
