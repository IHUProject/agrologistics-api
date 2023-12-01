import { NextFunction, Response, Request } from 'express';
import Company from '../models/Company';
import { ICompany } from '../interfaces/interfaces';
import { ForbiddenError } from '../errors/forbidden';

export const isCurrentUserValid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const company: ICompany | null = await Company.findById(id);
  const members: string[] = [];

  if (company?.owner) {
    members.push(company.owner._id.toString());
  }
  if (company?.employees && company.employees.length > 0) {
    company.employees.forEach((emp) => members.push(emp._id.toString()));
  }

  if (!members.includes(req.currentUser?.userId.toString() as string)) {
    throw new ForbiddenError('You cant perform this action');
  }

  next();
};
