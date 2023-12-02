import { Request } from 'express';
import { ICompany } from '../interfaces/interfaces';
import Company from '../models/Company';
import { ForbiddenError } from '../errors/forbidden';

export const isEmployToThisCompany = async (req: Request) => {
  const { id } = req.params;
  const { userId } = req.body;
  const company: ICompany | null = await Company.findOne({
    $or: [{ owner: userId }, { employees: { $in: [userId] } }],
  });

  if (company?._id.toString() !== id) {
    throw new ForbiddenError('This employ belongs to other company!');
  }
};
