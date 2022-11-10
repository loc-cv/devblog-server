import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createNewComment,
  deleteCommentById,
  findCommentById,
  findComments,
  updateCommentById,
} from '../services/comment-service';
import { findPostById } from '../services/post-service';
import AppError from '../utils/app-error';

/**
 * Create a comment.
 * @route POST /api/comments
 * @access user
 */
export const createComment = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { content, parentId, postId } = req.body;

  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `Can't find any post with ID: ${postId}`,
    );
  }

  if (parentId) {
    const parent = await findCommentById(parentId);
    if (!parent) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `Can't find any comment with ID: ${parentId}`,
      );
    } else if (String(parent.post._id) !== postId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Parent comment does not belong to the post provided.',
      );
    }
  }

  const comment = await createNewComment({
    post: post._id,
    author: user._id,
    parent: parentId || null,
    content,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ status: 'success', data: { comment } });
};

/**
 * Get all comments.
 * @route GET /api/comments?postId=...
 * @access public
 */
export const getAllComments = async (req: Request, res: Response) => {
  const { postId } = req.query;
  let comments = [];
  if (postId) {
    const post = await findPostById(String(postId));
    if (!post) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `Cannot find any post with ID: ${postId}`,
      );
    }
    comments = await findComments({ post: postId });
  } else {
    comments = await findComments();
  }

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', results: comments.length, data: { comments } });
};

/**
 * Get a single comment
 * @route GET /api/comments/:commentId
 * @access public
 */
export const getSingleComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const comment = await findCommentById(commentId);
  if (!comment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `No comment with ID: ${commentId}`,
    );
  }
  res.status(StatusCodes.OK).json({ status: 'success', data: { comment } });
};

/**
 * Update comment content
 * NOTE: Only admin or user who created the comment can update comment
 * @route PATCH /api/comments/:commentId
 * @access user (admin or comment author)
 */
export const updateComment = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { commentId } = req.params;
  const comment = await findCommentById(commentId);
  if (!comment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `No comment with ID: ${commentId}`,
    );
  }

  // Only admin or user who created the comment can update comment
  if (comment.author.username !== user.username && user.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Update has aborted. You are not admin or author of the comment.',
    );
  }

  // Update comment content
  await updateCommentById(commentId, { $set: { content: req.body.content } });
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Update comment successfully.' });
};

/**
 * Delete a comment
 * NOTE: Only admin or user who created the comment can delete comment
 * @route DELETE /api/comments/:commentId
 * @access user (admin or comment author)
 */
export const deleteComment = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { commentId } = req.params;
  const comment = await findCommentById(commentId);
  if (!comment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `No comment with ID: ${commentId}`,
    );
  }

  // Only admin or user who created the comment can update comment
  if (comment.author.username !== user.username && user.role !== 'admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Update has aborted. You are not admin or author of the comment.',
    );
  }

  await deleteCommentById(commentId);
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Delete comment successfully' });
};
