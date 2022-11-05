import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/app-error';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user } = res.locals;
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in');
  }

  // Check if user account has been banned
  if (user.isBanned) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account has been banned');
  }

  next();
};
