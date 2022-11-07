import express from 'express';
import {
  createTag,
  deleteTag,
  getAllTags,
  getSingleTag,
  updateTag,
} from '../controllers/tag-controller';
import { deserializeUser } from '../middlewares/deserialize-user';
import { requireAuth } from '../middlewares/require-auth';
import { restrictTo } from '../middlewares/restrict-to';
import { validate } from '../middlewares/validate';
import { newTagInputSchema, updateTagInputSchema } from '../schemas/tag-schema';

const router = express.Router();

// Public routes
router.route('/').get(getAllTags);
router.route('/:tagName').get(getSingleTag);

// Admin routes
router.use(deserializeUser, requireAuth);
router.use(restrictTo('admin'));

router.post('/', validate(newTagInputSchema), createTag);
router
  .route('/:tagName')
  .patch(validate(updateTagInputSchema), updateTag)
  .delete(deleteTag);

export default router;
