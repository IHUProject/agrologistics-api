import { NextFunction, Request, Response } from 'express';
import { NotFoundError, UnauthorizedError } from '../errors';
import { ICompany } from '../interfaces/interfaces';
import Company from '../models/Company';

export const isCompanyExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const companyId: string = req.body.companyId || req.params.companyId;
  const company: ICompany | null = await Company.findById(companyId);

  if (!company) {
    throw new NotFoundError('No company found!');
  }

  next();
};

export const verifyUserCompanyMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const companyId: string = req.body.companyId || req.params.companyId;

  if (companyId !== req.currentUser?.company?.toString()) {
    throw new UnauthorizedError('You are not belong to this company!');
  }

  next();
};
