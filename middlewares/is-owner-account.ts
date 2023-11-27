import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors';

export const isOwnerOfTheAccount = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (id !== req.currentUser?.userId) {
    throw new UnauthorizedError('You can perform this action!');
  }

  next();
};
