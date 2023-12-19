import {
  IAccountant,
  IClient,
  ICompany,
  IDataImgur,
  IPopulate,
  IProduct,
  IUser,
  IUserWithID,
} from '../interfaces/interfaces';
import Company from '../models/Company';
import { ImageService } from './general-services/image-service';
import { Roles } from '../interfaces/enums';
import User from '../models/User';
import Accountant from '../models/Accountant';
import { ForbiddenError } from '../errors/forbidden';
import { BadRequestError, NotFoundError } from '../errors';
import { UserService } from './user-service';
import Product from '../models/Product';
import Client from '../models/Client';
import { deleteDocuments } from '../helpers/delete-docs';
import { DataLayerService } from './general-services/data-layer-service';

export class CompanyService extends DataLayerService<ICompany> {
  private imageService: ImageService;
  private userService: UserService;
  private populateOptions: IPopulate[];
  private select: string;

  constructor() {
    super(Company);
    this.populateOptions = [
      {
        path: 'owner',
        select: 'firstName lastName image _id',
      },
      {
        path: 'employees',
        select: 'firstName lastName image _id role',
      },
      {
        path: 'accountant',
        select: 'firstName lastName email _id',
      },
      {
        path: 'products',
        select: 'name price _id',
      },
      {
        path: 'clients',
        select: 'fullName phone _id',
      },
    ];
    this.select = '-createdAt -updateAt';
    this.imageService = new ImageService();
    this.userService = new UserService();
  }

  public async createCompany(
    payload: ICompany,
    currentUser: IUserWithID,
    file: Express.Multer.File | undefined
  ) {
    const { userId } = currentUser as IUserWithID;

    const isFirstCompany = (await Company.countDocuments({})) === 0;
    if (!isFirstCompany) {
      throw new ForbiddenError('Company already exists!');
    }

    const logo = await this.imageService.handleSingleImage(file);
    const company = await super.create({ ...payload, logo, owner: userId });

    await this.userService.update(
      userId.toString(),
      {
        role: Roles.OWNER,
      },
      ''
    );

    return await this.getOne(company._id, this.select, this.populateOptions);
  }

  public async updateCompany(
    payload: ICompany,
    companyId: string,
    file: Express.Multer.File | undefined
  ) {
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
    const employees = (await User.find()) as IUser[];
    const accountants = (await Accountant.find()) as IAccountant[];
    const products = (await Product.find()) as IProduct[];
    const clients = (await Client.find()) as IClient[];

    await Promise.all(
      employees.map((emp) => {
        const { _id, role } = emp;
        if (role !== Roles.UNCATEGORIZED) {
          return User.findByIdAndUpdate(_id, {
            role: Roles.UNCATEGORIZED,
          });
        }
        return Promise.resolve();
      })
    );

    await deleteDocuments(accountants, Accountant);
    await deleteDocuments(products, Product);
    await deleteDocuments(clients, Client);

    return await this.delete(companyId);
  }

  async getCompany() {
    const company = await Company.findOne({})
      .select('-createdAt -updateAt')
      .populate(this.populateOptions);

    if (!company) {
      throw new NotFoundError('No company exists!');
    }

    return company;
  }

  async addToCompany(userId: string, role: Roles) {
    if (role && role === Roles.OWNER) {
      throw new BadRequestError('You can not make an employ owner!');
    }

    const user = (await this.userService.getSingleUser(userId)) as IUser;

    const isWorking = user.role !== Roles.UNCATEGORIZED;
    if (isWorking) {
      throw new BadRequestError('User is already working to the company!');
    }

    await Company.updateOne({}, { $push: { employees: userId } });
    await this.userService.changeUserRole(userId, role || Roles.EMPLOY, true);

    const message = `The user ${user.firstName} ${
      user.lastName
    } has been added to the company with role: ${
      role.replace('_', ' ') || Roles.EMPLOY
    }`;

    return message;
  }

  async removeFromCompany(userId: string) {
    const user = (await this.userService.getSingleUser(userId)) as IUser;

    const { role } = user;
    if (role === Roles.UNCATEGORIZED) {
      throw new BadRequestError('User does not work to the company!');
    }
    if (role === Roles.OWNER) {
      throw new ForbiddenError('You can not remove the owner!');
    }

    this.userService.deleteUser(userId, true);
    return `The employ has been removed for the company!`;
  }
}
