import { NextFunction, Request, Response } from 'express';
import { ConflictError, NotFoundError } from '../errors';
import Company from '../models/Company';
import { ICompany } from '../interfaces/interfaces';

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

export const hasExistingCompanyRelations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    suppliers,
    employees,
    accountant,
    owner,
    purchases,
    clients,
    products,
  } = req.body as ICompany;

  const hasRelations =
    suppliers?.length ||
    employees?.length ||
    accountant ||
    owner ||
    purchases?.length ||
    clients?.length ||
    products?.length;

  if (hasRelations) {
    throw new ConflictError(
      'Operation forbidden: Existing company references detected.'
    );
  }

  next();
};
