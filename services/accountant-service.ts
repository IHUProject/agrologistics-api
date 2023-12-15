import Accountant from '../models/Accountant';
import { IAccountant } from '../interfaces/interfaces';
import { ForbiddenError } from '../errors/forbidden';
import Company from '../models/Company';

export class AccountantService {
  public async deleteAccountant(accId: string) {
    await Company.updateOne(
      { accountant: accId },
      { $set: { accountant: null } }
    );

    return await Accountant.findByIdAndDelete(accId).select('-createdAt');
  }

  public async createAccountant(payload: IAccountant) {
    const { firstName, lastName, address, email, phone, latitude, longitude } =
      payload;

    const isFirstAccountant = (await Accountant.countDocuments({})) === 0;
    if (!isFirstAccountant) {
      throw new ForbiddenError('Accountant already exists!');
    }

    const accountant = await Accountant.create({
      firstName,
      lastName,
      address,
      email,
      phone,
      latitude,
      longitude,
    });

    await Company.updateOne({}, { $set: { accountant: accountant._id } });

    return await Accountant.findById(accountant._id).select('-createdAt');
  }

  public async updateAccountant(payload: IAccountant, accId: string) {
    const { firstName, lastName, address, email, phone, latitude, longitude } =
      payload;

    const accountant = await Accountant.findByIdAndUpdate(
      accId,
      {
        firstName,
        lastName,
        address,
        email,
        phone,
        latitude,
        longitude,
      },
      { new: true, runValidators: true }
    ).select('-createdAt');

    return accountant;
  }

  public async getSingleAccountant() {
    return await Accountant.findOne({}).select('-createdAt');
  }
}
