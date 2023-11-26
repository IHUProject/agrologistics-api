import { ForbiddenError } from '../errors/forbidden';
import { IUserWithID } from '../interfaces/interfaces';
import { isValidToken } from '../helpers';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.signedCookies.token;

  if (!token) {
    throw new ForbiddenError('Access Denied');
  }

  try {
    const payload: IUserWithID = isValidToken(token) as IUserWithID;

    // Attach the user to the req object
    req.currentUser = {
      userId: payload.userId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: payload.role,
      image: payload.image,
    };

    next();
  } catch (error) {
    throw new ForbiddenError('Access Denied');
  }
};

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.signedCookies.token;

  if (token) {
    throw new BadRequestError('You are all ready logged in');
  }

  next();
};

export const isNotLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.signedCookies.token;

  if (!token) {
    throw new BadRequestError('There is no user to logout');
  }

  next();
};
