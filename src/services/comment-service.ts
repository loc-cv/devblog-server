import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Comment, { IComment, ICommentDocument } from '../models/comment-model';
import { IUser } from '../models/user-model';

const populatedUserFields =
  'email username firstName lastName profilePhoto isBanned';

export const findCommentById = async (id: string) => {
  const comment = await Comment.findById(id).populate<{ author: IUser }>(
    'author',
    populatedUserFields,
  );

  return comment;
};

export const createNewComment = async (input: Partial<IComment>) => {
  const comment = await Comment.create(input);
  return comment;
};

export const findComments = async (filter?: FilterQuery<ICommentDocument>) => {
  let query;
  if (filter) {
    query = Comment.find(filter);
  } else {
    query = Comment.find();
  }
  query.sort('-createdAt').populate('author', populatedUserFields);
  const comments = await query;
  return comments;
};

export const updateCommentById = async (
  id: string,
  update: UpdateQuery<ICommentDocument>,
  options?: QueryOptions,
) => {
  const comment = await Comment.findByIdAndUpdate(id, update, options);
  return comment;
};

const deleteCommentAndAllChildren = async (comment: ICommentDocument) => {
  const oneLevelDownSubComments = await Comment.find({ parent: comment._id });
  if (oneLevelDownSubComments.length === 0) {
    // no children, just delete the comment
    await comment.remove();
  } else {
    // has children, delete them
    oneLevelDownSubComments.forEach(item => deleteCommentAndAllChildren(item));

    // delete itself after deleting all of its children
    deleteCommentAndAllChildren(comment);
  }
};

export const deleteCommentById = async (id: string) => {
  // Delete the comment all comments that are the child of its
  const comment = await Comment.findById(id);
  if (comment) {
    await deleteCommentAndAllChildren(comment);
  }
};
