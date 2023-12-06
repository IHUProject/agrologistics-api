import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../errors';

export const validateCoordinates = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { latitude, longitude } = req.body;
  if (latitude && !longitude) {
    throw new BadRequestError('Add longitude!');
  }

  if (!latitude && longitude) {
    throw new BadRequestError('Add latitude!');
  }

  next();
};

export const validateQueryPage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page } = req.query;

  if (page && isNaN(Number(page))) {
    throw new BadRequestError('Page number must be a valid number');
  }

  const pageNumber = Number(page) || 1;

  if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
    throw new BadRequestError('Page number must be a positive safe integer');
  }

  next();
};

export const validateFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { files } = req;
  if (files && !files.image) {
    return next(
      new BadRequestError('Something went wrong with the files, try again')
    );
  }

  next();
};
