import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { excludeUserFields, findAllUsers } from '../services/user-service';

/**
 * Get all users.
 * @route GET /api/users
 * @access admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await findAllUsers(req.query);
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
