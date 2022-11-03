import config from 'config';
import { StatusCodes } from 'http-status-codes';
import { CookieOptions, Request, Response } from 'express';
import {
  createUser,
  findUser,
  generateUsername,
  signAccessToken,
} from '../services/user-service';
import AppError from '../utils/app-error';

const accessTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() +
      parseInt(config.get<string>('accessTokenExpiresIn'), 10) * 60 * 1000,
  ),
  maxAge: parseInt(config.get<string>('accessTokenExpiresIn'), 10) * 60 * 1000,
  httpOnly: true,
  sameSite: 'none',
};

// Only set secure to true in production
if (process.env.NODE_ENV === 'production')
  accessTokenCookieOptions.secure = true;

/**
 * Register User
 * @access Public
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  const username = await generateUsername(firstName, lastName);

  const user = await createUser({
    firstName,
    lastName,
    email,
    username,
    password,
  });

  const accessToken = await signAccessToken(user);

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('loggedIn', true, {
    ...accessTokenCookieOptions,
    httpOnly: false,
  });

  res.status(StatusCodes.CREATED).json({ status: 'success', accessToken });
};

/**
 * Login User
 * @access Public
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findUser({ email });
  if (!user || !(await user.comparePasswords(password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  if (user.isBanned) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account has been banned');
  }

  const accessToken = await signAccessToken(user);

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('loggedIn', true, {
    ...accessTokenCookieOptions,
    httpOnly: false,
  });

  res.status(StatusCodes.OK).json({ status: 'success', accessToken });
};

/**
 * Log out user
 * NOTE: On client, also delete the accessToken
 * @access Public
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('accessToken', accessTokenCookieOptions);
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'User logged out' });
};
