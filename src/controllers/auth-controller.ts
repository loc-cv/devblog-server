import config from 'config';
import { CookieOptions, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import {
  createNewUser,
  findOneUser,
  generateUsername,
  saveUser,
  signTokens,
  updateOneUser,
  updateUserById,
} from '../services/user-service';
import AppError from '../utils/app-error';
import { verifyJwt } from '../utils/jwt';
import { isValidObjectId } from '../utils/mongoose';

export const accessTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + ms(config.get<string>('accessTokenExpiresIn')),
  ),
  maxAge: ms(config.get<string>('accessTokenExpiresIn')),
  httpOnly: true,
  sameSite: 'none',
  secure: false,
};

export const refreshTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + ms(config.get<string>('refreshTokenExpiresIn')),
  ),
  maxAge: ms(config.get<string>('refreshTokenExpiresIn')),
  httpOnly: true,
  sameSite: 'none',
  secure: false,
};

/**
 * Register User
 * @access Public
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  const username = await generateUsername(firstName, lastName);

  const user = await createNewUser({
    firstName,
    lastName,
    email,
    username,
    password,
  });

  const { accessToken, refreshToken } = await signTokens(user);

  user.refreshTokens = [refreshToken];
  await saveUser(user);

  if (req.cookies?.refreshToken) {
    res.clearCookie('refreshToken', refreshTokenCookieOptions);
  }

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'Your registration has been successfully completed',
  });
};

/**
 * Login User
 * @access Public
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findOneUser({ email });
  if (!user || !(await user.comparePasswords(password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password');
  }

  if (user.isBanned) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'This account has been banned',
    );
  }

  const { accessToken, refreshToken } = await signTokens(user);

  await updateOneUser({ email }, { $push: { refreshTokens: refreshToken } });

  if (req.cookies?.refreshToken) {
    res.clearCookie('refreshToken', refreshTokenCookieOptions);
  }

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Logged in successfully' });
};

/**
 * Log out user
 * @access Public
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('accessToken', accessTokenCookieOptions);

  // const { user } = res.locals;
  // await redisClient.del(`users#${user._id}`);

  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await updateOneUser(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } },
    );
    res.clearCookie('refreshToken', refreshTokenCookieOptions);
  }
  res.sendStatus(StatusCodes.NO_CONTENT);
};

/**
 * Get a new pair of refresh token and access token
 * @access Public
 * @route GET /api/v1/auth/refresh
 */
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  const errorMessage = 'Could not refresh access token';

  if (!refreshToken) {
    throw new AppError(StatusCodes.FORBIDDEN, errorMessage);
  }
  res.clearCookie('refreshToken', refreshTokenCookieOptions);

  const user = await findOneUser({ refreshTokens: refreshToken });

  // Check for refresh token reuse
  if (!user) {
    const decoded = jwt.decode(refreshToken);
    if (
      typeof decoded !== 'string' &&
      decoded?.sub &&
      isValidObjectId(decoded.sub)
    ) {
      try {
        await updateUserById(decoded.sub, { $set: { refreshTokens: [] } });
      } catch (error) {
        console.log(error);
      }
    }
    throw new AppError(StatusCodes.FORBIDDEN, errorMessage);
  }

  // Verify refresh token
  const decoded = verifyJwt<{ sub: string }>(
    refreshToken,
    'refreshTokenPublicKey',
  );
  if (!decoded) {
    await updateUserById(String(user._id), {
      $pull: { refreshTokens: refreshToken },
    });
    throw new AppError(StatusCodes.FORBIDDEN, errorMessage);
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await signTokens(user);

  await updateUserById(String(user._id), {
    $pull: { refreshTokens: refreshToken },
  });
  await updateUserById(String(user._id), {
    $push: { refreshTokens: newRefreshToken },
  });

  res.cookie('accessToken', newAccessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Access token refreshed successfully',
  });
};
