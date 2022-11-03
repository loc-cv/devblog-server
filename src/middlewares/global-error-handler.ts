import { Error } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { ErrorRequestHandler } from 'express';
import _ from 'lodash';
import { ZodError } from 'zod';
import AppError from '../utils/app-error';

const createMongooseCastError = (err: Error.CastError) => {
  const message = `Invalid ${err.path === '_id' ? 'ID' : err.path}: ${
    err.value
  }`;
  return new AppError(StatusCodes.BAD_REQUEST, message);
};

const createMongooseDuplicateKeyError = (err: any) => {
  const field = Object.keys(err.keyValue)[0];
  const value = Object.values(err.keyValue)[0];
  const message = `${_.capitalize(
    field,
  )} ${value} has already been taken. Please use another one.`;
  return new AppError(StatusCodes.CONFLICT, message);
};

const createMongooseValidationError = (err: Error.ValidationError) => {
  const errorMessages = Object.values(err.errors).map(item => item.message);
  const message = `Invalid input data: ${errorMessages[0]}`; // Only send the first validation message
  return new AppError(StatusCodes.BAD_REQUEST, message);
};

const createZodError = (err: ZodError) => {
  const { message } = err.issues[0];
  return new AppError(StatusCodes.BAD_REQUEST, message);
};

export const globalErrorHandler: ErrorRequestHandler = async (
  err,
  req,
  res,
  next,
) => {
  let customError: AppError;

  if (err.isOperational) {
    customError = err;
  } else if (err instanceof Error.CastError) {
    customError = createMongooseCastError(err);
  } else if (err instanceof Error.ValidationError) {
    customError = createMongooseValidationError(err);
  } else if (err.code === 11000) {
    customError = createMongooseDuplicateKeyError(err);
  } else if (err instanceof ZodError) {
    customError = createZodError(err);
  } else {
    customError = new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong, try again later.',
    );
  }

  res.status(customError.statusCode).json({
    status: customError.status,
    message: customError.message,
    error: process.env.NODE_ENV === 'production' ? undefined : err,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
