import Accountant from '../models/Accountant';
import { IAccountant } from '../interfaces/interfaces';
import { ForbiddenError } from '../errors/forbidden';
import Company from '../models/Company';
import { DataLayerService } from './general-services/data-layer-service';

export class AccountantService extends DataLayerService<IAccountant> {
  select: string;

  constructor() {
    super(Accountant);
    this.select = '-createdAt';
  }

  public async createAccountant(payload: IAccountant) {
    const isFirstAccountant = (await Accountant.countDocuments({})) === 0;
    if (!isFirstAccountant) {
      throw new ForbiddenError('Accountant already exists!');
    }

    const accountant = await super.create(payload);
    await Company.updateOne({}, { $set: { accountant: accountant._id } });

    return await this.getOne(accountant._id, this.select);
  }

  public async updateAccountant(payload: IAccountant, accId: string) {
    return await this.update(accId, payload, this.select);
  }

  public async deleteAccountant(accId: string) {
    const deletedAccountant = await this.delete(accId);
    await Company.updateOne(
      { accountant: accId },
      { $set: { accountant: null } }
    );

    return deletedAccountant;
  }

  public async getSingleAccountant() {
    return await Accountant.findOne({}).select(this.select);
  }
}
