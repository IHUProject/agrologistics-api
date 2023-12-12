import Accountant from '../models/Accountant';
import { IAccountant } from '../interfaces/interfaces';
import { Types } from 'mongoose';
import { ForbiddenError } from '../errors/forbidden';

export class AccountantService {
  public async deleteAccountant(accId: string) {
    await Accountant.findByIdAndDelete(accId);
    return 'The accountant has been deleted!';
  }

  public async createAccountant(payload: IAccountant) {
    const { firstName, lastName, address, email, phone, latitude, longitude } =
      payload;

    const isAccountantExists = (await Accountant.countDocuments({}))
      ? true
      : false;
    if (isAccountantExists) {
      throw new ForbiddenError('Accountant already exists!');
    }

    const newAccountant = await Accountant.create({
      firstName,
      lastName,
      address,
      email,
      phone,
      latitude,
      longitude,
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

  public async getSingleAccountant() {
    const accountant = await Accountant.findOne({});

    if (!accountant) {
      return { msg: `Your company does not have accountant` };
    }
    return { accountantInfo: accountant };
  }
}
