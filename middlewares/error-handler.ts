import { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import { ICustomError, IUpdatedError } from '../interfaces/interfaces';

export const errorHandlerMiddleware = (
  err: IUpdatedError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const customError: ICustomError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again',
  };

  if (err.name === 'CastError') {
    customError.msg = `Error: the value ${err.value} is wrong format or type for property ${err.path}`;
    customError.statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((item) => {
      if (item.name === 'CastError') {
        return `The value ${item.value} is wrong format or type for property ${item.path}`;
      }
      if (item.kind === 'minlength') {
        return `The ${item.path} must be more than ${
          item.properties.minlength - 1
        } characters.`;
      }
      if (item.kind === 'maxlength') {
        return `The ${item.path} must be less than ${
          item.properties.maxlength + 1
        } characters.`;
      }
      return item;
    });

    customError.msg = errors[0].message ?? errors[0];
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `The ${Object.keys(
      err.keyValue
    )} you provide is already in use, please choose something else`;
    customError.statusCode = 409;
  }

  if (err.path === '_id') {
    customError.msg = `Wrong database ID format (ID : ${err.value})`;
    customError.statusCode = 400;
  }

  return res
    .status(Number(customError.statusCode))
    .json({ message: customError.msg });
};
