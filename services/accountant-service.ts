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

    await Company.updateOne({}, { $set: { accountant: newAccountant._id } });

    return newAccountant;
  }

  public async updateAccountant(payload: IAccountant, accId: string) {
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
      },
      { new: true, runValidators: true }
    ).select('-createdAt');

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
