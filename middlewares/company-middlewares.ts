import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import Company from '../models/Company';

export const isCompanyExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { companyId } = req.params;
  const company = await Company.findById(companyId);

  if (!company) {
    throw new NotFoundError('No company found!');
  }

  next();
};
