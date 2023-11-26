import { Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { IUserWithID } from '../interfaces/interfaces';

export const getCurrentUser = (req: Request, res: Response) => {
  const userService: UserService = new UserService(req);
  const currentUser: IUserWithID = userService.getCurrentUser();
  res.status(StatusCodes.OK).json({ userInfo: currentUser });
};

export const updateUser = (req: Request, res: Response) => {
  res.status(200).json({ asd: 'update user' });
};

export const deleteUser = (req: Request, res: Response) => {
  res.status(200).json({ asd: 'delete user' });
};

export const updateProfilePicture = (req: Request, res: Response) => {
  res.status(200).json({ asd: 'update profile pic user' });
};

export const getUsers = (req: Request, res: Response) => {
  res.status(200).json({ asd: 'get users' });
};
