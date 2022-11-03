import config from 'config';
import { FilterQuery, QueryOptions } from 'mongoose';
import UserModel, { IUser, IUserDocument } from '../models/user-model';
import { redisClient } from '../utils/connect-redis';
import { signJwt } from '../utils/jwt';

export const createUser = async (input: Partial<IUser>) => {
  const user = await UserModel.create(input);
  return user;
};

export const findUserById = async (id: string) => {
  const user = await UserModel.findById(id);
  return user;
};

export const findAllUsers = async () => {
  const users = await UserModel.find();
  return users;
};

export const findUser = async (
  query: FilterQuery<IUserDocument>,
  options: QueryOptions = {},
) => {
  const user = await UserModel.findOne(query, {}, options);
  return user;
};

export const signAccessToken = async (user: IUserDocument) => {
  const accessToken = signJwt(
    { sub: user._id },
    { expiresIn: config.get<string>('accessTokenExpiresIn') },
  );

  // Create a Session
  redisClient.set(`users#${user._id}`, JSON.stringify(user), { EX: 60 * 60 });

  return accessToken;
};

export async function generateUsername(firstName: string, lastName: string) {
  let username = `${firstName}${lastName}`;
  let user = await UserModel.findOne({ username });
  while (user) {
    username += (+new Date() * Math.random()).toString().substring(0, 2);
    // eslint-disable-next-line no-await-in-loop
    user = await UserModel.findOne({ username });
  }
  return username;
}
