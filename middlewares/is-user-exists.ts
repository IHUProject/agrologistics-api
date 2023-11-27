import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import { IUser } from '../interfaces/interfaces';
import User from '../models/User';

export const isUserExits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user: IUser | null = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User does not exists');
  }

  next();
};
