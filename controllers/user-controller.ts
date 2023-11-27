import { Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { IUser, IUserWithID } from '../interfaces/interfaces';

export const getCurrentUser = (req: Request, res: Response) => {
  const userService: UserService = new UserService(req);
  const currentUser: IUserWithID = userService.getCurrentUser();
  res.status(StatusCodes.OK).json({ userInfo: currentUser });
};

export const updateUser = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req);
  const updateUser: IUser = await userService.updateUser();
  res.status(StatusCodes.OK).json({ userInfo: updateUser });
};

export const deleteUser = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req);
  const message: string = await userService.deleteUser();

  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
    secure: true,
    sameSite: 'none',
    signed: true,
  });

  res.status(StatusCodes.OK).json({ message });
};

export const getUsers = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req);
  const currentUser: IUser[] = await userService.getAllUsers();
  res.status(StatusCodes.OK).json({ userInfo: currentUser });
};

export const getSingleUser = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req);
  const user: IUser = await userService.getSingleUser();
  res.status(StatusCodes.OK).json({ userInfo: user });
};

export const changePassword = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req);
  const result: string = await userService.changePassword();
  res.status(StatusCodes.OK).json({ msg: result });
};
