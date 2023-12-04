import { Response } from 'express';
import { attachTokens } from './jwt';
import { createTokenUser } from './create-token-user';
import { IUser, IUserWithID } from '../interfaces/interfaces';
import User from '../models/User';

export const reattachTokens = async (
  res: Response,
  id: string,
  postmanRequest: boolean
) => {
  const updatedUser: IUser | null = await User.findById(id);

  if (updatedUser) {
    const tokenUser: IUserWithID = createTokenUser(updatedUser);
    attachTokens(res, tokenUser, postmanRequest);
  }
};
