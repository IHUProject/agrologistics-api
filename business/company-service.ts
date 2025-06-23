import {
  IAccountant,
  ICategory,
  IClient,
  ICompany,
  ICredential,
  IDataImgur,
  IExpense,
  IPopulate,
  IProduct,
  IPurchase,
  ISupplier,
  IUserWithID
} from '../types/interfaces'
import { ImageService } from '../intergration/image-service'
import { Roles } from '../types/enums'
import User from '../data-access/models/User'
import Supplier from '../data-access/models/Supplier'
import Accountant from '../data-access/models/Accountant'
import { NotFoundError } from '../common/errors'
import { UserService } from './user-service'
import Product from '../data-access/models/Product'
import Client from '../data-access/models/Client'
import { deleteDocuments } from '../common/helpers/delete-docs'
import { BaseRepository } from '../data-access/base-repository'
import Purchase from '../data-access/models/Purchase'
import { populateCompanyOpt } from '../config/populate'
import Company from '../data-access/models/Company'
import Category from '../data-access/models/Category'
import Expanse from '../data-access/models/Expense'
import Credential from '../data-access/models/Credential'
import { checkIsFirstDocument } from '../common/helpers/is-first-doc'

export class CompanyService extends BaseRepository<ICompany> {
  private imageService: ImageService
  private userService: UserService
  private populateOptions: IPopulate[]
  private select: string

  constructor() {
    super(Company)
    this.populateOptions = populateCompanyOpt
    this.select = '-createdAt -updateAt'
    this.imageService = new ImageService()
    this.userService = new UserService()
  }

  public async createCompany(
    payload: ICompany,
    currentUser: IUserWithID,
    file: Express.Multer.File | undefined
  ) {
    await super.validateData(payload)
    await checkIsFirstDocument(Company)

    const logo = await this.imageService.handleSingleImage(file)
    const { userId } = currentUser as IUserWithID
    const company = await super.create({ ...payload, logo, owner: userId })
    const { _id } = company

    await this.userService.update(userId.toString(), {
      role: Roles.OWNER,
      company: _id
    })

    return await this.getOne(_id, this.select, this.populateOptions)
  }

  public async updateCompany(
    payload: ICompany,
    companyId: string,
    file: Express.Multer.File | undefined
  ) {
    await super.validateData(payload)

    let company = await this.getOne(companyId)
    let logo: IDataImgur | undefined

    if (file) {
      const { deletehash } = company!.logo
      if (deletehash) {
        await this.imageService.deleteSingleImage(deletehash)
      }
      logo = await this.imageService.handleSingleImage(file)
    }

    company = await this.update(
      companyId,
      { ...payload, logo },
      this.select,
      this.populateOptions
    )

    return company
  }

  public async deleteCompany(companyId: string) {
    const accountants = (await Accountant.find()) as IAccountant[]
    const products = (await Product.find()) as IProduct[]
    const clients = (await Client.find()) as IClient[]
    const purchases = (await Purchase.find()) as IPurchase[]
    const suppliers = (await Supplier.find()) as ISupplier[]
    const categories = (await Category.find()) as ICategory[]
    const expenses = (await Expanse.find()) as IExpense[]
    const creds = (await Credential.find()) as ICredential[]

    await User.updateMany(
      { role: { $ne: Roles.UNCATEGORIZED } },
      { $set: { role: Roles.UNCATEGORIZED } }
    )

    await deleteDocuments(accountants, Accountant)
    await deleteDocuments(products, Product)
    await deleteDocuments(clients, Client)
    await deleteDocuments(purchases, Purchase)
    await deleteDocuments(suppliers, Supplier)
    await deleteDocuments(categories, Category)
    await deleteDocuments(expenses, Expanse)
    await deleteDocuments(creds, Credential)

    return await this.delete(companyId)
  }

  async getCompany() {
    const company = await Company.findOne()
      .select('-createdAt -updateAt')
      .populate(this.populateOptions)

    if (!company) {
      throw new NotFoundError('No company exists!')
    }

    return company
  }

  async isCompanyExists() {
    const isExists = (await Company.find()).length ? true : false
    return isExists
  }
}
