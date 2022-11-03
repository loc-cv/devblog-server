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
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Invalid token or session has expired',
    );
  }
  next();
};
