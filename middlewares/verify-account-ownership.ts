import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors';

export const verifyAccountOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (id !== req.currentUser?.userId.toString()) {
    throw new UnauthorizedError('You can perform this action!');
  }

  next();
};
