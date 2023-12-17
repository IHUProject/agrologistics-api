import {
  IAccountant,
  IClient,
  ICompany,
  IDataImgur,
  IProduct,
  IUser,
  IUserWithID,
} from '../interfaces/interfaces';
import Company from '../models/Company';
import { ImageService } from './image-service';
import { Roles } from '../interfaces/enums';
import User from '../models/User';

import Accountant from '../models/Accountant';
import { ForbiddenError } from '../errors/forbidden';
import { BadRequestError, NotFoundError } from '../errors';
import { UserService } from './user-service';
import Product from '../models/Product';
import Client from '../models/Client';
import { deleteDocuments } from '../helpers/delete-docs';

export class CompanyService {
  private imageService: ImageService;
  private userService: UserService;
  constructor() {
    this.imageService = new ImageService();
    this.userService = new UserService();
  }

  public async createCompany(
    payload: ICompany,
    currentUser: IUserWithID,
    file: Express.Multer.File | undefined
  ) {
    const { name, phone, afm, address, founded, latitude, longitude } = payload;
    const { userId } = currentUser as IUserWithID;

    const isFirstCompany = (await Company.countDocuments({})) === 0;
    if (!isFirstCompany) {
      throw new ForbiddenError('Company already exists!');
    }

    let logo: IDataImgur | undefined;
    if (file) {
      logo = await this.imageService.handleSingleImage(file);
    }

    const company = await Company.create({
      name,
      phone,
      owner: userId,
      afm,
      logo,
      address,
      founded,
      latitude,
      longitude,
    });

    await User.findByIdAndUpdate(userId, {
      role: Roles.OWNER,
    });

    return (await Company.findById(company._id)
      .select('-createdAt -updateAt')
      .populate({
        path: 'owner',
        select: 'firstName lastName email image _id role',
      })) as ICompany;
  }

  public async updateCompany(
    payload: ICompany,
    companyId: string,
    file: Express.Multer.File | undefined
  ) {
    const { name, phone, afm, address, founded, latitude, longitude } = payload;

    let company = (await Company.findById(companyId)) as ICompany;

    let logo: IDataImgur | undefined;
    if (file) {
      const { deletehash } = company.logo;
      if (deletehash) {
        await this.imageService.deleteSingleImage(deletehash);
      }
      logo = await this.imageService.handleSingleImage(file);
    }

    company = (await Company.findByIdAndUpdate(
      companyId,
      {
        name,
        phone,
        afm,
        logo,
        address,
        founded,
        latitude,
        longitude,
      },
      { new: true, runValidators: true }
    )
      .select('-createdAt -updateAt')
      .populate({
        path: 'owner',
        select: 'firstName lastName image _id',
      })) as ICompany;

    return company;
  }

  public async deleteCompany(companyId: string) {
    const employees = (await User.find()) as IUser[];
    const accountants = (await Accountant.find()) as IAccountant[];
    const products = (await Product.find()) as IProduct[];
    const clients = (await Client.find()) as IClient[];

    employees.forEach(async (emp) => {
      const { _id, role } = emp;
      if (role !== Roles.UNCATEGORIZED) {
        await User.findByIdAndUpdate(_id, {
          role: Roles.UNCATEGORIZED,
        });
      }
    });

    await deleteDocuments(accountants, Accountant);
    await deleteDocuments(products, Product);
    await deleteDocuments(clients, Client);

    return await Company.findByIdAndDelete(companyId).select(
      '-createdAt -updateAt'
    );
  }

  async getCompany() {
    const company = await Company.findOne({})
      .select('-createdAt -updateAt')
      .populate({
        path: 'owner',
        select: 'firstName lastName image _id',
      })
      .populate({
        path: 'employees',
        select: 'firstName lastName image _id role',
      })
      .populate({
        path: 'accountant',
        select: 'firstName lastName email _id',
      })
      .populate({
        path: 'products',
        select: 'name price _id',
      })
      .populate({
        path: 'clients',
        select: 'fullName phone _id',
      });

    if (!company) {
      throw new NotFoundError('No company exists!');
    }

    return company;
  }

  async addToCompany(userId: string, role: Roles) {
    if (role && role === Roles.OWNER) {
      throw new BadRequestError('You can not make an employ owner!');
    }

    const user = (await User.findById(userId)) as IUser;

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
    const user = (await User.findById(userId)) as IUser;

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
