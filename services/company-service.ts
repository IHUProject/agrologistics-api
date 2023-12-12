import {
  IAccountant,
  ICompany,
  IDataImgur,
  IUser,
  IUserWithID,
} from '../interfaces/interfaces';
import Company from '../models/Company';
import { ImageService } from './image-service';
import { Roles } from '../interfaces/enums';
import User from '../models/User';

import Accountant from '../models/Accountant';
import { ForbiddenError } from '../errors/forbidden';

export class CompanyService {
  private imageService: ImageService;
  constructor() {
    this.imageService = new ImageService();
  }

  public async createCompany(
    payload: ICompany,
    currentUser: IUserWithID,
    file: Express.Multer.File | undefined
  ) {
    const { name, phone, afm, address, founded, latitude, longitude } = payload;
    const { userId } = currentUser as IUserWithID;

    const isCompanyExists = (await Company.countDocuments({})) ? true : false;
    if (isCompanyExists) {
      throw new ForbiddenError('Company already exists!');
    }

    let logo: IDataImgur | undefined;
    if (file) {
      logo = await this.imageService.handleSingleImage(file);
    }

    const newCompany = await (
      await Company.create({
        name,
        phone,
        owner: userId,
        afm,
        logo,
        address,
        founded,
        latitude,
        longitude,
      })
    ).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });

    await User.findByIdAndUpdate(userId, {
      role: Roles.OWNER,
    });

    return (await Company.findById(newCompany._id).populate({
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

    const company = (await Company.findById(companyId)) as ICompany;

    let logo: IDataImgur | undefined;
    if (file) {
      const { deletehash } = company.logo;
      if (deletehash) {
        await this.imageService.deleteSingleImage(deletehash);
      }
      logo = await this.imageService.handleSingleImage(file);
    }

    const updatedCompany = (await Company.findByIdAndUpdate(
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
    ).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany;

    return updatedCompany;
  }

  public async deleteCompany(companyId: string) {
    const employees = (await User.find({})) as IUser[];
    const accountants = (await Accountant.find({})) as IAccountant[];

    employees.forEach(async (emp) => {
      const { _id } = emp;
      await User.findByIdAndUpdate(_id, {
        role: Roles.UNCATEGORIZED,
      });
    });
    accountants.forEach(async (acc) => {
      const { _id } = acc;
      await Accountant.findByIdAndDelete(_id);
    });

    await Company.findByIdAndDelete(companyId);

    return `The company has been deleted!`;
  }

  async getCompany() {
    return await Company.findOne({}).populate({
      path: 'owner',
      select: 'firstName lastName email image _id',
    });
  }
}
