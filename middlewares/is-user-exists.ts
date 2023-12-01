import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import { IUser } from '../interfaces/interfaces';
import User from '../models/User';

export const isUserExits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id: string = req.body.userId || req.params.id;
  const user: IUser | null = await User.findById(id);

  if (!user) {
    throw new NotFoundError('User does not exists');
  }

  next();
};
