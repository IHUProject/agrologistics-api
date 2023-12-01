import { NextFunction, Request, Response } from 'express';
import { ICompany } from '../interfaces/interfaces';
import { BadRequestError } from '../errors';
import Company from '../models/Company';

export const isWorking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  const company: ICompany | null = await Company.findOne({
    $or: [{ owner: userId }, { employees: { $in: [userId] } }],
  });

  if (company) {
    throw new BadRequestError('This employ belongs to other company!');
  }

  next();
};
