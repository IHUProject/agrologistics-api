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
    console.log(err.errors);

    customError.msg = Object.values(err.errors)
      .map(
        (item) =>
          `Value ${item.value} is wrong type of (${item.valueType}) for property ${item.path}`
      )
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

  return res
    .status(Number(customError.statusCode))
    .json({ msg: customError.msg });
};
