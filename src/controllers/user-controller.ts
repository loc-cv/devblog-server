import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { parseInt } from 'lodash';
import { excludeUserFields, findAllUsers } from '../services/user-service';
import AppError from '../utils/app-error';

/**
 * Get all users.
 * @route GET /api/users
 * @access admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  const page =
    (typeof req.query.page === 'string' && parseInt(req.query.page, 10)) || 1;
  const limit =
    (typeof req.query.limit === 'string' && parseInt(req.query.limit, 10)) ||
    10;

  if (page < 0 || limit < 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please provide positive values for page and limit',
    );
  }

  const users = await findAllUsers({ page, limit });

  res.status(StatusCodes.OK).json({
    status: 'success',
    results: users.length,
    data: { users: users.map(user => excludeUserFields(user)) },
  });
};

/**
 * Get info of currently logged in user.
 * @route GET /api/users/me
 * @access user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const { user } = res.locals;
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: { user: excludeUserFields(user) },
  });
};
