import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/app-error';

export const restrictTo =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals;

    // Check if user account has been banned
    if (user.isBanned) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'This account has been banned.',
      );
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You are not allowed to perform this acction',
      );
    }

    next();
  };
