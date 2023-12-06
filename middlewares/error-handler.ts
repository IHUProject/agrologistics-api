import { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import { ICustomError, IUpdatedError } from '../interfaces/interfaces';
import fs from 'fs';

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
    customError.msg = err.message;
    customError.statusCode = 404;
  }

  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => {
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
      })
      .join(' ');

    console.log(Object.values(err.errors));

    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `${Object.keys(
      err.keyValue
    )} is already in use, please choose something else`;
    customError.statusCode = 400;
  }

  if (err.path === '_id') {
    customError.msg = `Wrong database ID format (ID : ${err.value})`;
    customError.statusCode = 400;
  }

  if (fs.existsSync('tmp')) {
    fs.rmSync('tmp', { recursive: true });
  }
  // console.log(err);

  return res
    .status(Number(customError.statusCode))
    .json({ msg: customError.msg });
};
