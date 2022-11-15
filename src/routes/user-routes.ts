import express from 'express';
import {
  addPostToSaveList,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  removePostFromSaveList,
  toggleBanUser,
  updateCurrentUser,
  updateCurrentUserPassword,
  updateUser,
} from '../controllers/user-controller';
import { deserializeUser } from '../middlewares/deserialize-user';
import { requireAuth } from '../middlewares/require-auth';
import { restrictTo } from '../middlewares/restrict-to';
import { validate } from '../middlewares/validate';
import {
  addPostToSaveListInputSchema,
  updatePasswordInputSchema,
  updateUserInputSchema,
} from '../schemas/user-schema';

const router = express.Router();

// User routes
router.use(deserializeUser, requireAuth);
router
  .route('/me')
  .get(getCurrentUser)
  .patch(validate(updateUserInputSchema), updateCurrentUser);
router
  .route('/me/password')
  .put(validate(updatePasswordInputSchema), updateCurrentUserPassword);
router.route('/:userId').get(getSingleUser);
router
  .route('/me/savedposts')
  .post(validate(addPostToSaveListInputSchema), addPostToSaveList);
router.route('/me/savedposts/:postId').delete(removePostFromSaveList);

// Admin routes
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);
router
  .route('/:userId')
  .patch(validate(updateUserInputSchema), updateUser)
  .delete(deleteUser);
router.route('/:userId/toggleban').put(toggleBanUser);

export default router;
