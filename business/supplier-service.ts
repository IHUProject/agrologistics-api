import { populateSupplierOpt } from '../config/populate'
import { IPopulate, ISupplier } from '../types/interfaces'
import Company from '../data-access/models/Company'
import Expanse from '../data-access/models/Expense'
import Supplier from '../data-access/models/Supplier'
import { BaseRepository } from '../data-access/base-repository'

export class SupplierService extends BaseRepository<ISupplier> {
  private select: string
  private populateOptions: IPopulate[]
  private searchFields: string[]

  constructor() {
    super(Supplier)
    this.populateOptions = populateSupplierOpt
    this.searchFields = ['email', 'address', 'fullName', 'lastName']
    this.select = '-createdAt'
  }

  public async createSupplier(payload: ISupplier) {
    await super.validateData(payload)

    const supplier = await super.create(payload)
    const { _id, company } = supplier

    await Company.updateOne(
      { _id: company },
      { $push: { suppliers: _id } }
    )

    return await this.getOne(_id, this.select, this.populateOptions)
  }

  public async getSingleSupplier(supplierId: string) {
    return await this.getOne(supplierId, this.select, this.populateOptions)
  }

  public async getSuppliers(
    page: string,
    searchString: string,
    limit: string
  ) {
    return await this.getMany(
      page,
      searchString,
      this.select,
      this.searchFields,
      this.populateOptions,
      isNaN(Number(limit)) ? 10 : Number(limit)
    )
  }

  public async deleteSupplier(supplierId: string) {
    const deletedSupplier = (await this.delete(supplierId)) as ISupplier
    const { _id, company } = deletedSupplier

    await Company.updateOne(
      { _id: company },
      { $pull: { suppliers: _id } }
    )
    await Expanse.updateMany(
      { supplier: _id },
      { $unset: { supplier: null } }
    )

    return deletedSupplier
  }

  public async updateSupplier(payload: ISupplier, supplierId: string) {
    await super.validateData(payload)
    return await this.update(
      supplierId,
      payload,
      this.select,
      this.populateOptions
    )
  }
}
