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
  IUserWithID,
} from '../interfaces/interfaces';
import { ImageService } from './general-services/image-service';
import { Roles } from '../interfaces/enums';
import User from '../models/User';
import Supplier from '../models/Supplier';
import Accountant from '../models/Accountant';
import { NotFoundError } from '../errors';
import { UserService } from './user-service';
import Product from '../models/Product';
import Client from '../models/Client';
import { deleteDocuments } from '../helpers/delete-docs';
import { DataLayerService } from './general-services/data-layer-service';
import Purchase from '../models/Purchase';
import { populateCompanyOpt } from '../config/populate';
import Company from '../models/Company';
import Category from '../models/Category';
import Expanse from '../models/Expense';
import Credential from '../models/Credential';
import { checkIsFirstDocument } from '../helpers/is-first-doc';

export class CompanyService extends DataLayerService<ICompany> {
  private imageService: ImageService;
  private userService: UserService;
  private populateOptions: IPopulate[];
  private select: string;

  constructor() {
    super(Company);
    this.populateOptions = populateCompanyOpt;
    this.select = '-createdAt -updateAt';
    this.imageService = new ImageService();
    this.userService = new UserService();
  }

  public async createCompany(
    payload: ICompany,
    currentUser: IUserWithID,
    file: Express.Multer.File | undefined
  ) {
    await super.validateData(payload);
    await checkIsFirstDocument(Company);

    const logo = await this.imageService.handleSingleImage(file);
    const { userId } = currentUser as IUserWithID;
    const company = await super.create({ ...payload, logo, owner: userId });
    const { _id } = company;

    await this.userService.update(userId.toString(), {
      role: Roles.OWNER,
      company: _id,
    });

    return await this.getOne(_id, this.select, this.populateOptions);
  }

  public async updateCompany(
    payload: ICompany,
    companyId: string,
    file: Express.Multer.File | undefined
  ) {
    await super.validateData(payload);

    let company = await this.getOne(companyId);
    let logo: IDataImgur | undefined;

    if (file) {
      const { deletehash } = company!.logo;
      if (deletehash) {
        await this.imageService.deleteSingleImage(deletehash);
      }
      logo = await this.imageService.handleSingleImage(file);
    }

    company = await this.update(
      companyId,
      { ...payload, logo },
      this.select,
      this.populateOptions
    );

    return company;
  }

  public async deleteCompany(companyId: string) {
    const accountants = (await Accountant.find()) as IAccountant[];
    const products = (await Product.find()) as IProduct[];
    const clients = (await Client.find()) as IClient[];
    const purchases = (await Purchase.find()) as IPurchase[];
    const suppliers = (await Supplier.find()) as ISupplier[];
    const categories = (await Category.find()) as ICategory[];
    const expenses = (await Expanse.find()) as IExpense[];
    const creds = (await Credential.find()) as ICredential[];

    await User.updateMany(
      { role: { $ne: Roles.UNCATEGORIZED } },
      { $set: { role: Roles.UNCATEGORIZED } }
    );

    await deleteDocuments(accountants, Accountant);
    await deleteDocuments(products, Product);
    await deleteDocuments(clients, Client);
    await deleteDocuments(purchases, Purchase);
    await deleteDocuments(suppliers, Supplier);
    await deleteDocuments(categories, Category);
    await deleteDocuments(expenses, Expanse);
    await deleteDocuments(creds, Credential);

    return await this.delete(companyId);
  }

  async getCompany() {
    const company = await Company.findOne()
      .select('-createdAt -updateAt')
      .populate(this.populateOptions);

    if (!company) {
      throw new NotFoundError('No company exists!');
    }

    return company;
  }

  async isCompanyExists() {
    const isExists = (await Company.find()).length ? true : false;
    return isExists;
  }
}
