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

  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map(
        (item) =>
          `Value ${item.value} is wrong type (${item.valueType}) for property ${item.path}`
      )
      .join(',');
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `${Object.keys(
      err.keyValue
    )} is already in use, please choose something else`;
    customError.statusCode = 400;
  }

  if (err.name === 'CastError') {
    customError.msg = `Error for value: ${err.value} (Cast Error)`;
    customError.statusCode = 404;
  }

  if (err.errors && err.errors.role && err.errors.role?.kind === 'enum') {
    customError.statusCode = 400;
    if (err.errors.role.value !== '') {
      customError.msg = `Value '${err.errors.role.value}' is wrong!`;
    } else {
      customError.msg = `Not allowed empty strings`;
    }
  }

  if (err.path === '_id') {
    customError.msg = `Wrong mongoDB ID format (ID : ${err.value})`;
    customError.statusCode = 400;
  }

  console.log(err);

  return res
    .status(Number(customError.statusCode))
    .json({ msg: customError.msg });
};
