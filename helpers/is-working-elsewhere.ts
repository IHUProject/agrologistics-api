import { ICompany } from '../interfaces/interfaces';
import { BadRequestError } from '../errors';
import Company from '../models/Company';

export const isWorkingElsewhere = async (id: string) => {
  const company: ICompany | null = await Company.findOne({
    $or: [{ owner: id }, { employees: { $in: [id] } }],
  });

  if (company) {
    throw new BadRequestError('This employ belongs to other company!');
  }
};
