import Accountant from '../models/Accountant';
import { IAccountant } from '../interfaces/interfaces';
import { BadRequestError } from '../errors';
import { Types } from 'mongoose';

export class AccountantService {
  public async deleteAccountant(accId: string) {
    await Accountant.findByIdAndDelete(accId);
    return 'The accountant has been deleted!';
  }

  public async createAccountant(
    payload: IAccountant,
    usersCompanyId: Types.ObjectId
  ) {
    const { firstName, lastName, address, email, phone, latitude, longitude } =
      payload;

    const accountant = await Accountant.findById(usersCompanyId);
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
      company: usersCompanyId,
    });

    return newAccountant;
  }

  public async updateAccountant(
    payload: IAccountant,
    accId: string,
    userId: Types.ObjectId
  ) {
    const { firstName, lastName, address, email, phone, latitude, longitude } =
      payload;

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

  public async getSingleAccountant(companyId: Types.ObjectId) {
    const accountant = await Accountant.findOne({ company: companyId });

    if (!accountant) {
      return { msg: `Your company does not have accountant` };
    }
    return { accountantInfo: accountant };
  }
}
