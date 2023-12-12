import { NextFunction, Request, Response } from 'express';
import { NotFoundError, UnauthorizedError } from '../errors';
import User from '../models/User';
import { IUserWithID } from '../interfaces/interfaces';
import { ForbiddenError } from '../errors/forbidden';

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
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User does not exists!');
  }

  next();
};

export const preventSelfModification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { currentUser } = req;

  if (userId === (currentUser as IUserWithID).userId.toString()) {
    throw new ForbiddenError('You can perform that action to your account!');
  }

  next();
};
