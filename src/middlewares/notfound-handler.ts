import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/app-error';

const notFoundHandler = async (req: Request) => {
  throw new AppError(
    StatusCodes.NOT_FOUND,
    `Cannot ${req.method} ${req.originalUrl} on this server.`,
  );
};

export default notFoundHandler;
