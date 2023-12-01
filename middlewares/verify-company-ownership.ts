import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors';
import Company from '../models/Company';
import { ICompany } from '../interfaces/interfaces';

export const verifyCompanyOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const company: ICompany | null = await Company.findById(id).populate({
    path: 'owner',
    select: 'firstName lastName email image _id role',
  });

  console.log(
    company?.owner._id.toString(),
    req.currentUser?.userId.toString()
  );

  if (company?.owner._id.toString() !== req.currentUser?.userId.toString()) {
    throw new UnauthorizedError('You can perform this action!');
  }

  next();
};
