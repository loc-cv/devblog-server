import config from 'config';
import { StatusCodes } from 'http-status-codes';
import _, { parseInt } from 'lodash';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import User, {
  excludedFields,
  IUser,
  IUserDocument,
} from '../models/user-model';
import AppError from '../utils/app-error';
import { signJwt } from '../utils/jwt';

const populatedUserFields =
  'email username firstName lastName profilePhoto isBanned';
const populatedTagsFields = 'name';

export const createNewUser = async (input: Partial<IUser>) => {
  const user = await User.create(input);
  return user;
};

export const saveUser = async (user: IUserDocument) => {
  await user.save({ validateModifiedOnly: true });
};

export const findUserById = async (id: string) => {
  const user = await User.findById(id);
  return user;
};

export const findAllUsers = async (
  queryString: Record<string, unknown> = {},
) => {
  const query = User.find().sort('-createdAt');

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
  const total = await User.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  query.skip(skip).limit(limit);

  const users = await query;
  return { users, total, totalPages, page, results: users.length };
};

export const findOneUser = async (
  filter: FilterQuery<IUserDocument>,
  options?: QueryOptions,
) => {
  const user = await User.findOne(filter, {}, options);
  return user;
};

export const updateUserById = async (
  id: string,
  update: UpdateQuery<IUserDocument>,
  options?: QueryOptions,
) => {
  const user = await User.findByIdAndUpdate(id, update, options);
  return user;
};

export const updateOneUser = async (
  filter: FilterQuery<IUserDocument>,
  update: UpdateQuery<IUserDocument>,
  options?: QueryOptions,
) => {
  const user = await User.findOneAndUpdate(filter, update, options);
  return user;
};

export const deleteUserById = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  return user;
};

export const getUserSavedPosts = async (user: IUserDocument) => {
  await user.populate({
    path: 'savedPosts',
    populate: [
      { path: 'author', select: populatedUserFields },
      { path: 'tags', select: populatedTagsFields },
    ],
  });
  return user.savedPosts;
};

export const signTokens = async (user: IUserDocument) => {
  const accessToken = signJwt({ sub: user._id }, 'accessTokenPrivateKey', {
    expiresIn: config.get<string>('accessTokenExpiresIn'),
  });
  const refreshToken = signJwt({ sub: user._id }, 'refreshTokenPrivateKey', {
    expiresIn: config.get<string>('refreshTokenExpiresIn'),
  });

  // // Create a Session
  // redisClient.set(`users#${user._id}`, JSON.stringify(user), { EX: 60 * 60 });

  return { accessToken, refreshToken };
};

export const generateUsername = async (firstName: string, lastName: string) => {
  let username = `${firstName}${lastName}`;
  let user = await User.findOne({ username });
  while (user) {
    username += (+new Date() * Math.random()).toString().substring(0, 2);
    // eslint-disable-next-line no-await-in-loop
    user = await User.findOne({ username });
  }
  return username;
};

export const isUsernameUnique = async (username: string) => {
  const user = await findOneUser({ username });
  if (user) return false;
  return true;
};

export const excludeUserFields = (user: IUserDocument) => {
  return _.omit(user.toJSON(), excludedFields);
};
