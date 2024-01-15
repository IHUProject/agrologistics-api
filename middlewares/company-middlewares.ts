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
  const company = req.body as ICompany;

  const relations = [
    company.suppliers,
    company.employees,
    company.purchases,
    company.clients,
    company.products,
    company.expenses,
    company.categories,
  ];

  const hasRelations =
    relations.some((relation) => relation?.length) ||
    company.accountant ||
    company.owner;

  if (hasRelations) {
    throw new ConflictError(
      'Operation forbidden: Existing company references detected.'
    );
  }

  next();
};
