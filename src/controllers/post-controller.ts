import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NewPostInput } from '../schemas/post-schema';
import {
  createNewPost,
  deletePostById,
  filterTags,
  findAllPosts,
  findPostById,
  updatePostById,
} from '../services/post-service';
import { updateUserById } from '../services/user-service';
import AppError from '../utils/app-error';

/**
 * Create a post
 * @route POST /api/posts
 * @access user
 */
export const createPost = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const {
    body: { title, summary, content, tags },
  } = req as NewPostInput;

  const post = await createNewPost(
    {
      title,
      summary,
      content,
      author: user,
    },
    tags,
  );
  await updateUserById(user._id, { $inc: { postCount: 1 } });
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'New post created successfully',
    data: { post: { id: post._id } },
  });
};

/**
 * Get all posts
 * @route GET /api/posts?tags[]=...&tags[]=...
 * @access public
 */
export const getAllPosts = async (req: Request, res: Response) => {
  const { posts, results } = await findAllPosts(req.query);
  res.status(StatusCodes.OK).json({
    status: 'success',
    results,
    data: { posts },
  });
};

/**
 * Get a single post
 * @route GET /api/posts/:postId
 * @access public
 */
export const getSinglePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const post = await updatePostById(
    postId,
    { $inc: { viewCount: 1 } },
    { new: true, timestamps: false },
  );
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, `No post with ID: ${postId}`);
  }
  res.status(StatusCodes.OK).json({ status: 'success', data: { post } });
};

/**
 * Update post
 * NOTE: Only admin or author of the post can update post
 * @route PATCH /api/posts/:postId
 * @access user (admin or post author)
 */
export const updatePost = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { postId } = req.params;

  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, `No post with ID: ${postId}`);
  }

  // Only admin or author of the post can update post
  if (post.author.username !== user.username && user.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Update has aborted. You are not admin or author of the post.',
    );
  }

  const { tags, title, summary, content } = req.body;
  await updatePostById(postId, {
    $set: {
      title: title || post.title,
      content: content || post.content,
      summary: summary || post.summary,
      tags: (tags && (await filterTags(tags))) || post.tags,
    },
  });

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Update post successfully.' });
};

/**
 * Delete a post
 * NOTE: Only admin or author of the post can delete post
 * @route DELETE /api/posts/:postId
 * @access user (admin or post author)
 */
export const deletePost = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { postId } = req.params;

  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, `No post with ID: ${postId}`);
  }

  // Only admin or author of the post can update post
  if (post.author.username !== user.username && user.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Cannot delete this post. You must be admin or author of the post to perform this action.',
    );
  }

  await deletePostById(postId);

  // Decrease author post count by 1
  updateUserById(String(user._id), { $inc: { postCount: -1 } });

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Delete post successfully.' });
};

/**
 * Toogle like post.
 * @route PUT /api/posts/:postId/toggle-like
 * @access user
 */
export const toggleLikePost = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { postId } = req.params;
  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, `No post with ID: ${postId}`);
  }

  // Toggle like
  const isAlreadyLiked = post.likes.some(
    like => String(like._id) === String(user._id),
  );
  let message = '';
  if (isAlreadyLiked) {
    // If user already liked the post, remove (pull) user from likes array.
    await updatePostById(postId, { $pull: { likes: user._id } });
    message = 'Unlike post successfully.';
  } else {
    // else if user didn't like the post, add him/her to likes array ...
    // ... and remove (pull) user from dislikes array (if he/she already disliked the post).
    await updatePostById(
      postId,
      {
        $push: { likes: user._id },
        $pull: { dislikes: user._id },
      },
      { runValidators: true },
    );
    message = 'Like post successfully.';
  }

  res.status(StatusCodes.OK).json({ status: 'success', message });
};

/**
 * Toggle dislike post.
 * @route PUT /api/posts/:postId/toggle-dislike
 * @access user
 */
export const toggleDislikePost = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { postId } = req.params;
  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, `No post with ID: ${postId}`);
  }

  // Toggle dislike
  const isAlreadyDisliked = post.dislikes.some(
    dislike => String(dislike._id) === String(user._id),
  );
  let message = '';
  if (isAlreadyDisliked) {
    // If user already disliked the post, remove (pull) user from dislikes array.
    await updatePostById(postId, { $pull: { dislikes: user._id } });
    message = 'Undislike post successfully.';
  } else {
    // else if user didn't dislike the post, add him/her to dislikes array ...
    // ... and remove (pull) user from likes array (if he/she already liked the post).
    await updatePostById(
      postId,
      {
        $push: { dislikes: user._id },
        $pull: { likes: user._id },
      },
      { runValidators: true },
    );
    message = 'Dislike post successfully.';
  }

  res.status(StatusCodes.OK).json({ status: 'success', message });
};
