import { StatusCodes } from 'http-status-codes';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Post, { IPost, IPostDocument } from '../models/post-model';
import AppError from '../utils/app-error';
import { findOneTag } from './tag-service';
import { excludeUserFields, findOneUser } from './user-service';

// const populatedUserFields =
//   'email username firstName lastName profilePhoto isBanned';
// const populatedTagsFields = 'name';

export const filterTags = async (tags: string[]) => {
  const filteredTags = (
    await Promise.all(
      tags.map(async tagName => {
        const tag = await findOneTag({ name: tagName });
        if (!tag) return [];
        return tag;
      }),
    )
  )
    .flatMap(tag => tag)
    .map(tagDoc => ({
      _id: tagDoc._id,
      name: tagDoc.name,
      description: tagDoc.description,
    }));

  if (filteredTags.length < 1) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please provide at least 1 valid tag',
    );
  }
  if (filteredTags.length > 4) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Please provide up to 4 tags');
  }

  return filteredTags;
};

export const savePost = async (post: IPostDocument) => {
  await post.save({ validateModifiedOnly: true });
};

export const createNewPost = async (input: Partial<IPost>, tags: string[]) => {
  const filteredTags = await filterTags(tags);
  const post = await Post.create({ ...input, tags: filteredTags });
  return post;
};

function isStringArray(arr: any): arr is Array<string> {
  if (!(arr instanceof Array)) return false;
  return arr.every(v => typeof v === 'string');
}

export const findAllPosts = async (
  queryString: Record<string, unknown> = {},
) => {
  const { author, savedby, tags } = queryString;
  const query = Post.find().sort('-createdAt');

  // Query by author
  if (typeof author === 'string' && author !== '') {
    const user = await findOneUser({ username: author });
    if (!user) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `No user with username ${author}`,
      );
    }
    if (user.isBanned) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `The user with username ${author} is banned`,
      );
    }
    query.where('author.username', author);
  }

  // Query by savedby
  if (typeof savedby === 'string' && savedby !== '') {
    const user = await findOneUser({ username: savedby });
    if (!user) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `No user with username ${author}`,
      );
    }
    if (user.isBanned) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `The user with username ${author} is banned`,
      );
    }
    query.find({ savedBy: user._id });
  }

  // Query by tags
  if (tags && isStringArray(tags)) {
    query.find({ 'tags.name': { $all: tags } });
  }

  // Don't query posts whose author is banned
  query.where('author.isBanned').ne(true);

  // Pagination
  const page =
    (typeof queryString.page === 'string' && parseInt(queryString.page, 10)) ||
    1;
  const limit =
    (typeof queryString.limit === 'string' &&
      parseInt(queryString.limit, 10)) ||
    10;
  if (page < 0 || limit < 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please provide positive values for page and limit',
    );
  }
  const skip = (page - 1) * limit;
  // Count total results and pages before paginating
  const total = await Post.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  query.skip(skip).limit(limit);

  // Exec query
  const posts = await query.transform(async res => {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await Promise.all(
      res.map(async post => {
        const postAuthor = await findOneUser({
          username: post.author.username,
        });
        if (!postAuthor) return post;
        return Object.assign(post, { author: excludeUserFields(postAuthor) });
      }),
    );
  });

  return { posts, total, totalPages, page, perPage: limit };
};

export const findPostById = async (id: string) => {
  const post = await Post.findById(id);
  return post;
};

export const updatePostById = async (
  id: string,
  update: UpdateQuery<IPostDocument>,
  options?: QueryOptions,
) => {
  const post = await Post.findByIdAndUpdate(id, update, options);
  return post;
};

export const updateOnePost = async (
  filter: FilterQuery<IPostDocument>,
  update: UpdateQuery<IPostDocument>,
  options?: QueryOptions,
) => {
  const post = await Post.findOneAndUpdate(filter, update, options);
  return post;
};

export const updateManyPosts = async (
  filter: FilterQuery<IPostDocument>,
  update: UpdateQuery<IPostDocument>,
  options?: QueryOptions,
) => {
  const post = await Post.updateMany(filter, update, options);
  return post;
};

export const deletePostById = async (id: string) => {
  await Post.findByIdAndDelete(id);
};
