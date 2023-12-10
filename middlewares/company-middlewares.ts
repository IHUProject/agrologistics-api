import { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors';
import { IAccountant, ICompany, IUser } from '../interfaces/interfaces';
import Company from '../models/Company';
import { Types } from 'mongoose';
import Accountant from '../models/Accountant';
import User from '../models/User';

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
  const id: string =
    req.params.companyId || req.params.accId || req.params.userId;

  let entity: ICompany | IAccountant | IUser;
  let companyId: Types.ObjectId;
  if (req.params.companyId) {
    entity = (await Company.findById(id)) as ICompany;
    companyId = entity._id;
  } else if (req.params.accId) {
    entity = (await Accountant.findById(id)) as IAccountant;
    companyId = entity.company;
  } else if (req.params.userId) {
    entity = (await User.findById(id)) as IUser;
    companyId = entity.company;
  } else {
    throw new BadRequestError('Something went wrong!');
  }

  if (companyId.toString() !== req.currentUser?.company?.toString()) {
    throw new UnauthorizedError(
      'You can not change others company information!'
    );
  }

  next();
};
