import { NextFunction, Request, Response } from 'express';
import { Roles } from '../interfaces/enums';
import { ForbiddenError } from '../errors/forbidden';

export const checkRoleIfIsOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;
  if (role! === Roles.OWNER) {
    throw new ForbiddenError('You can not make an employ owner!');
  }
  next();
};
