import { populateProductOpt } from './config/populate'
import { IPopulate, IProduct, IUserWithID } from '../types/interfaces'
import Company from '../data-access/models/Company'
import Product from '../data-access/models/Product'
import Purchase from '../data-access/models/Purchase'
import { BaseRepository } from '../data-access/base-repository'

export class ProductService extends BaseRepository<IProduct> {
  private select: string
  private populateOptions: IPopulate[]
  private searchFields: string[]

  constructor() {
    super(Product)
    this.populateOptions = populateProductOpt
    this.searchFields = ['name', 'price', 'description']
    this.select = '-createdAt'
  }

  public async createProduct(payload: IProduct, currentUser: IUserWithID) {
    await super.validateData(payload)

    const { userId, company } = currentUser
    const product = await super.create({
      ...payload,
      createdBy: userId,
      company
    })
    const { _id } = product

    await Company.updateOne({ _id: company }, { $push: { products: _id } })

    return this.getOne(_id, this.select, this.populateOptions)
  }

  public async getSingleProduct(productId: string) {
    return await this.getOne(productId, this.select, this.populateOptions)
  }

  public async getProducts(
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

  public async updateProduct(payload: IProduct, productId: string) {
    await super.validateData(payload)
    return await this.update(
      productId,
      payload,
      this.select,
      this.populateOptions
    )
  }

  public async deleteProduct(productId: string) {
    const deletedProduct = await this.delete(productId)
    const { company, _id } = deletedProduct

    await Company.updateOne({ _id: company }, { $pull: { products: _id } })
    await Purchase.updateMany(
      { products: _id },
      { $pull: { products: _id } }
    )

    return deletedProduct
  }
}
