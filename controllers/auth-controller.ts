import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';

export const register = async (req: Request, res: Response) => {
  const authService = new AuthService(req, res);
  const newUser = await authService.registerUser();
  res.status(StatusCodes.CREATED).json(newUser);
};

export const login = async (req: Request, res: Response) => {
  const authService = new AuthService(req, res);
  const loggedInUser = await authService.loginUser();
  res.status(StatusCodes.OK).json({ userInfo: loggedInUser });
};

export const logout = (req: Request, res: Response) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
    secure: true,
    sameSite: 'none',
    signed: true,
  });

  res.status(StatusCodes.OK).json({ result: 'User logged out!' });
};
