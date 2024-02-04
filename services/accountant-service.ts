import Accountant from '../models/Accountant';
import { IAccountant, IPopulate, IUserWithID } from '../interfaces/interfaces';
import { ForbiddenError } from '../errors/forbidden';
import Company from '../models/Company';
import { DataLayerService } from './general-services/data-layer-service';
import { populateAccountantOpt } from '../config/populate';

export class AccountantService extends DataLayerService<IAccountant> {
  private select: string;
  private populationOptions: IPopulate[];

  constructor() {
    super(Accountant);
    this.select = '-createdAt';
    this.populationOptions = populateAccountantOpt;
  }

  public async createAccountant(
    payload: IAccountant,
    currentUser: IUserWithID
  ) {
    const { userId, company } = currentUser;

    const isFirstAccountant = (await Accountant.countDocuments({})) === 0;
    if (!isFirstAccountant) {
      throw new ForbiddenError('Accountant already exists!');
    }

    const accountant = await super.create({
      ...payload,
      createdBy: userId,
    });

    const { _id } = accountant;
    await Company.updateOne({ _id: company }, { $set: { accountant: _id } });

    return await this.getOne(_id, this.select, this.populationOptions);
  }

  public async updateAccountant(payload: IAccountant, accId: string) {
    return await this.update(
      accId,
      payload,
      this.select,
      this.populationOptions
    );
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
    return await Accountant.findOne()
      .select(this.select)
      .populate(this.populationOptions);
  }
}
