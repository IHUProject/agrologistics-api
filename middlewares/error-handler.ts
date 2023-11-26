import { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import { ICustomError, IUpdatedError } from '../interfaces/interfaces';

export const errorHandlerMiddleware = (
  err: IUpdatedError,
  req: Request,
  res: Response
) => {
  const customError: ICustomError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again',
  };

  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `There is already a field with the same value as this field you provide ---> ${Object.keys(
      err.keyValue
    )}, please choose something else`;
    customError.statusCode = 400;
  }

  if (err.name === 'CastError') {
    customError.msg = `No results for : ${err.value} (Cast Error)`;
    customError.statusCode = 404;
  }

  if (err.path === '_id') {
    customError.msg = `Wrong MongoDB ID format (ID : ${err.value})`;
    customError.statusCode = 404;
  }

  return res
    .status(Number(customError.statusCode))
    .json({ msg: customError.msg });
};
