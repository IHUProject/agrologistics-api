import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../errors';
import { Roles } from '../interfaces/enums';

export const validateRoleProperty = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;

  if (role && !Object.values(Roles).includes(role)) {
    throw new BadRequestError('Wrong role type!');
  }

  next();
};
