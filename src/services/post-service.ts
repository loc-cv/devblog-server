import { StatusCodes } from 'http-status-codes';
import { QueryOptions, UpdateQuery } from 'mongoose';
import Post, { IPost, IPostDocument } from '../models/post-model';
import { ITag } from '../models/tag-model';
import { IUser } from '../models/user-model';
import AppError from '../utils/app-error';
import { findOneTag } from './tag-service';
import { findOneUser } from './user-service';

const populatedUserFields =
  'email username firstName lastName profilePhoto isBanned';
const populatedTagsFields = 'name';

export const filterTags = async (tags: string[]) => {
  const filteredTags = (
    await Promise.all(
      tags.map(async tagName => {
        const tag = await findOneTag({ name: tagName });
        if (!tag) return [];
        return tag;
      }),
    )
  ).flatMap(tag => tag);

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
  await post.populate('tags', populatedTagsFields);
  await post.populate('author', populatedUserFields);
  return post;
};

function isStringArray(arr: any): arr is Array<string> {
  if (!(arr instanceof Array)) return false;
  return arr.every(v => typeof v === 'string');
}

export const findAllPosts = async (
  queryString: Record<string, unknown> = {},
) => {
  const query = Post.find().sort('-createdAt');

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
  query.skip(skip).limit(limit);

  let posts = await query
    .populate<{ author: IUser }>('author', populatedUserFields)
    .populate<{ tags: ITag[] }>('tags', populatedTagsFields);

  posts = posts.filter(post => !post.author.isBanned);

  const { author } = queryString;
  if (author) {
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
    posts = posts.filter(post => post.author.username === author);
  }

  const { tags } = queryString;
  if (tags && isStringArray(tags)) {
    const filteredPosts = posts.filter(post => {
      const postTagNames = post.tags.map(tag => tag.name);
      return tags.every(tag => postTagNames.includes(tag));
    });
    posts = filteredPosts;
  }

  return posts;
};

export const findPostById = async (id: string) => {
  const post = await Post.findById(id)
    .populate<{ author: IUser }>('author', populatedUserFields)
    .populate<{ tags: ITag[] }>('tags', populatedTagsFields);
  return post;
};

export const updatePostById = async (
  id: string,
  update: UpdateQuery<IPostDocument>,
  options?: QueryOptions,
) => {
  const post = await Post.findByIdAndUpdate(id, update, options)
    .populate<{ author: IUser }>('author', populatedUserFields)
    .populate<{ tags: ITag[] }>('tags', populatedTagsFields);
  return post;
};

export const deletePostById = async (id: string) => {
  await Post.findByIdAndDelete(id);
};
