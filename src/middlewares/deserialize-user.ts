import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { findUserById } from '../services/user-service';
import AppError from '../utils/app-error';
import { verifyJwt } from '../utils/jwt';

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let accessToken: string | null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    [accessToken] = authHeader.split(' ');
  } else if (req.cookies.accessToken) {
    accessToken = req.cookies.accessToken;
  } else {
    accessToken = null;
  }
  if (!accessToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in');
  }

  const decoded = verifyJwt<{ sub: string; iat: number }>(
    accessToken,
    'accessTokenPublicKey',
  );
  if (!decoded) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Invalid token or user doesn't exist",
    );
  }

  // // Check if user has a valid session
  // const session = await redisClient.get(`users#${decoded.sub}`);
  // if (!session) {
  //   throw new AppError(StatusCodes.UNAUTHORIZED, 'User session has expired');
  // }

  // Check if user still exist
  const user = await findUserById(decoded.sub);
  if (!user) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'User with that token does no longer exist',
    );
  }

  // Check if user changed password after the token was issued
  if (user.checkPasswordChanged(decoded.iat)) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Password has been changed. Please log in again.',
    );
  }

  res.locals.user = user;
  next();
};