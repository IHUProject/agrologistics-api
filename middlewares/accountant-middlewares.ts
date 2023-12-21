import { Request, Response, NextFunction } from 'express';
import Accountant from '../models/Accountant';
import { NotFoundError } from '../errors';

export const isAccountantExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accId } = req.params;

  const accountant = await Accountant.findById(accId);
  if (!accountant) {
    throw new NotFoundError('No accountant found!');
  }

  next();
};
