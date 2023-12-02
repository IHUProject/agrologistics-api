import { ICompany } from '../interfaces/interfaces';
import Company from '../models/Company';
import { ForbiddenError } from '../errors/forbidden';
import { NextFunction, Request, Response } from 'express';

export const isEmployOnSameCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const company: ICompany | null = await Company.findOne({
    $or: [{ owner: id }, { employees: { $in: [id] } }],
  });

  const companyCurrentUser: ICompany | null = await Company.findOne({
    $or: [
      { owner: req.currentUser?.userId },
      { employees: { $in: [req.currentUser?.userId] } },
    ],
  });

  if (company?._id.toString() !== companyCurrentUser?._id.toString()) {
    throw new ForbiddenError('This employ belongs to other company!');
  }

  next();
};
