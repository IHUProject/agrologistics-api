import { NextFunction, Request, Response } from 'express';
import { BadRequestError, ConflictError, UnauthorizedError } from '../errors';
import { IUser, IUserWithID } from '../interfaces/interfaces';
import { ForbiddenError } from '../errors/forbidden';
import { Roles } from '../interfaces/enums';

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

export const hasRoleProperty = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body as IUser;

  if (role) {
    throw new ConflictError('You can not change or add the role!');
  }

  next();
};

export const hasForbiddenRoleType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;

  if (role === Roles.OWNER || role === Roles.UNCATEGORIZED) {
    throw new BadRequestError(`Forbidden role type ${role}`);
  }

  next();
};
