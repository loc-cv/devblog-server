import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { findPostById, updatePostById } from '../services/post-service';
import {
  deleteUserById,
  excludeUserFields,
  findAllUsers,
  findUserById,
  isUsernameUnique,
  saveUser,
  signTokens,
  updateUserById,
} from '../services/user-service';
import AppError from '../utils/app-error';
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from './auth-controller';

/**
 * Get all users.
 * @route GET /api/users
 * @access admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await findAllUsers(req.query);
  res.status(StatusCodes.OK).json({
    status: 'success',
    results: users.length,
    data: { users: users.map(user => excludeUserFields(user)) },
  });
};

/**
 * Get a single user.
 * @route GET /api//users/:userId
 * @access user
 */
export const getSingleUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, `No user with ID: ${userId}`);
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: { user: excludeUserFields(user) },
  });
};

/**
 * Update user info (`password` CANNOT be updated through this route).
 * @route PATCH /api/users/:userId
 * @access admin
 */
export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, `No user with ID: ${userId}`);
  }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.bio = req.body.bio || user.bio;

  // Check unique username
  if (req.body.username && !(await isUsernameUnique(req.body.username))) {
    throw new AppError(StatusCodes.CONFLICT, 'Username has already been taken');
  }
  user.username = req.body.username || user.username;

  // Update user
  await saveUser(user);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Update user successfully' });
};

/**
 * Delete a user account.
 * @route DELETE /api/users/:userId
 * @access admin
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await deleteUserById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, `No user with ID: ${userId}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Delete user successfully' });
};

/**
 * Toggle ban (ban/unban) a user.
 * @route PUT /api/users/:userId/toggleban
 * @access admin
 */
export const toggleBanUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, `No user with ID: ${userId}`);
  }

  await updateUserById(
    userId,
    [{ $set: { isBanned: { $eq: [false, '$isBanned'] } } }],
    { new: true },
  );

  const message = `${user.isBanned ? 'Unban' : 'Ban'} user successfully`;
  res.status(StatusCodes.OK).json({ status: 'success', message });
};

/**
 * Get info of currently logged in user.
 * @route GET /api/users/me
 * @access user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const { user } = res.locals;
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: { user: excludeUserFields(user) },
  });
};

/**
 * Update password of currently logged in user.
 * @route PUT /api/users/me/password
 * @access user
 */
export const updateCurrentUserPassword = async (
  req: Request,
  res: Response,
) => {
  const { user } = res.locals;
  const { currentPassword, newPassword } = req.body;

  const currentUser = await findUserById(user._id);
  if (!currentUser) {
    throw new AppError(StatusCodes.NOT_FOUND, `Current user no longer exists`);
  }

  // Check current password
  if (!(await currentUser.comparePasswords(currentPassword))) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Current password is incorrect`,
    );
  }

  // Update password
  currentUser.password = newPassword;

  // Send new pair of accessToken and refreshToken
  const { accessToken, refreshToken } = await signTokens(currentUser);
  if (req.cookies?.refreshToken) {
    res.clearCookie('refreshToken', refreshTokenCookieOptions);
  }
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  // Invalidate every other refresh tokens
  currentUser.refreshTokens = [refreshToken];

  await saveUser(currentUser);
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Update password successfully',
  });
};

/**
 * Update information of currently logged in user (`password` CANNOT be updated through this route)
 * @route PATCH /api/users/me
 * @access user
 */
export const updateCurrentUser = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const currentUser = await findUserById(user._id);
  if (!currentUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Current user no longer exists');
  }

  currentUser.firstName = req.body.firstName || currentUser.firstName;
  currentUser.lastName = req.body.lastName || currentUser.lastName;
  currentUser.bio = req.body.bio || currentUser.bio;

  // Check unique username
  if (req.body.username && !(await isUsernameUnique(req.body.username))) {
    throw new AppError(StatusCodes.CONFLICT, 'Username has already been taken');
  }
  currentUser.username = req.body.username || currentUser.username;

  // Update user
  await saveUser(currentUser);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Update your info successfully' });
};

// /**
//  * Get all saved posts of current user
//  * @route GET /api/users/me/savedposts
//  * @access user
//  */
// export const getCurrentUserSavedPosts = async (req: Request, res: Response) => {
//   const { user } = res.locals;
//   const currentUser = await findUserById(user._id);
//   if (!currentUser) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'Current user no longer exists');
//   }
//   const savedPosts = await findAllPosts(req.query);
//   res.status(StatusCodes.OK).json({
//     status: 'success',
//     results: savedPosts.length,
//     data: { posts: savedPosts },
//   });
// };

/**
 * Add post to current user save list
 * @route POST /api/users/me/savedposts
 * @access user
 */
export const addPostToSaveList = async (req: Request, res: Response) => {
  const { postId } = req.body;
  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, `No post with ID: ${postId}`);
  }
  const { user } = res.locals;
  if (post.savedBy.includes(user._id)) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'You have already saved this post',
    );
  }
  await updateUserById(user._id, { $push: { savedPosts: post } });
  await updatePostById(postId, { $push: { savedBy: user } });
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Post added to your save list',
  });
};

/**
 * Remove post from current user save list
 * @route DELETE /api/users/me/savedposts/:postId
 * @access user
 */
export const removePostFromSaveList = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { postId } = req.params;
  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, `No post with ID: ${postId}`);
  }
  if (!post.savedBy.includes(user._id)) {
    throw new AppError(StatusCodes.CONFLICT, 'You have not saved this post');
  }
  await updatePostById(postId, { $pull: { savedBy: user._id } });
  await updateUserById(user._id, { $pull: { savedPosts: post._id } });
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Post removed from your save list',
  });
};
