import Accountant from '../data-access/models/Accountant'
import { IAccountant, IPopulate, IUserWithID } from '../types/interfaces'
import Company from '../data-access/models/Company'
import { BaseRepository } from '../data-access/base-repository'
import { populateAccountantOpt } from './config/populate'
import { checkIsFirstDocument } from '../common/helpers/is-first-doc'

export class AccountantService extends BaseRepository<IAccountant> {
  private select: string
  private populationOptions: IPopulate[]

  constructor() {
    super(Accountant)
    this.select = '-createdAt'
    this.populationOptions = populateAccountantOpt
  }

  public async createAccountant(
    payload: IAccountant,
    currentUser: IUserWithID
  ) {
    await super.validateData(payload)

    const { userId, company } = currentUser
    await checkIsFirstDocument(Accountant)

    const accountant = await super.create({
      ...payload,
      createdBy: userId
    })
    const { _id } = accountant

    await Company.updateOne(
      { _id: company },
      { $set: { accountant: _id } }
    )

    return await this.getOne(_id, this.select, this.populationOptions)
  }

  public async updateAccountant(payload: IAccountant, accId: string) {
    await super.validateData(payload)
    return await this.update(
      accId,
      payload,
      this.select,
      this.populationOptions
    )
  }

  public async deleteAccountant(accId: string) {
    const deletedAccountant = await this.delete(accId)

    await Company.updateOne(
      { accountant: accId },
      { $set: { accountant: null } }
    )

    return deletedAccountant
  }

  public async getSingleAccountant() {
    return await Accountant.findOne()
      .select(this.select)
      .populate(this.populationOptions)
  }
}
