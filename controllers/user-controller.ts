import { Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { IUser, IUserWithID } from '../interfaces/interfaces';

export const getCurrentUser = (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const currentUser: IUserWithID = userService.getCurrentUser();
  res.status(StatusCodes.OK).json({ userInfo: currentUser });
};

export const updateUser = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const updateUser: IUser = await userService.updateUser();
  res.status(StatusCodes.OK).json({ userInfo: updateUser });
};

export const deleteUser = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const message: string = await userService.deleteUser();
  res.status(StatusCodes.OK).json({ message });
};

export const getUsers = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const users: IUser[] = await userService.getUsers();
  res.status(StatusCodes.OK).json({ users, totalCount: users.length });
};

export const getSingleUser = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const user: IUser = await userService.getSingleUser();
  res.status(StatusCodes.OK).json({ userInfo: user });
};

export const changePassword = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const result: string = await userService.changePassword();
  res.status(StatusCodes.OK).json({ msg: result });
};

export const changeUserRole = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const result: string = await userService.changeUserRole();
  res.status(StatusCodes.OK).json({ msg: result });
};

export const addToCompany = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const result: string = await userService.addToCompany();
  res.status(StatusCodes.OK).json({ result });
};

export const removeFromCompany = async (req: Request, res: Response) => {
  const userService: UserService = new UserService(req, res);
  const result: string = await userService.removeFromCompany();
  res.status(StatusCodes.OK).json({ result });
};
