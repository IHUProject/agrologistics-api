import { Request } from 'express';
import Accountant from '../models/Accountant';
import { IUserWithID } from '../interfaces/interfaces';
import { BadRequestError } from '../errors';

export class AccountantService {
  constructor() {}

  public async deleteAccountant(req: Request) {
    const { accId } = req.params;
    await Accountant.findByIdAndDelete(accId);

    return 'The accountant has been deleted!';
  }

  public async createAccountant(req: Request) {
    const {
      firstName,
      lastName,
      address,
      email,
      phone,
      latitude,
      longitude,
      companyId,
    } = req.body;

    const accountant = await Accountant.findById(companyId);
    if (accountant) {
      throw new BadRequestError('The company has already an accountant!');
    }

    const newAccountant = await Accountant.create({
      firstName,
      lastName,
      address,
      email,
      phone,
      latitude,
      longitude,
      company: companyId,
    });

    return newAccountant;
  }

  public async updateAccountant(req: Request) {
    const { firstName, lastName, address, email, phone, latitude, longitude } =
      req.body;
    const { accId } = req.params;
    const { userId } = req.currentUser as IUserWithID;

    const updatedAccountant = await Accountant.findByIdAndUpdate(
      accId,
      {
        firstName,
        lastName,
        address,
        email,
        phone,
        latitude,
        longitude,
        updatedBy: userId,
      },
      { new: true, runValidators: true }
    )
      .select('-createdAt')
      .populate({
        path: 'updatedBy',
        select: 'firstName lastName _id role',
      });

    return updatedAccountant;
  }

  public async getSingleAccountant(req: Request) {
    const { company } = req.currentUser as IUserWithID;
    const accountant = await Accountant.findOne({ company });

    if (!accountant) {
      return { msg: `Your company does not have accountant` };
    }
    return accountant;
  }
}
