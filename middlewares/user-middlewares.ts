import { NextFunction, Request, Response } from 'express';
import { NotFoundError, UnauthorizedError } from '../errors';
import { IUser } from '../interfaces/interfaces';
import User from '../models/User';

export const verifyAccountOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  if (userId !== req.currentUser?.userId.toString()) {
    throw new UnauthorizedError('You can perform this action!');
  }

  next();
};

export const isUserExits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const user: IUser | null = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User does not exists!');
  }

  next();
};
