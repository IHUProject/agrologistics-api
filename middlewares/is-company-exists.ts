import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import { ICompany } from '../interfaces/interfaces';
import Company from '../models/Company';

export const isCompanyExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const company: ICompany | null = await Company.findById(id);

  if (!company) {
    throw new NotFoundError('No company exists with that ID');
  }

  next();
};
