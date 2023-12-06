import { Request, Response } from 'express';
import { ICompany, IUser, IUserWithID } from '../interfaces/interfaces';
import Company from '../models/Company';
import { UserService } from './user-service';
import { FilterQuery } from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { DefaultImage, Roles } from '../interfaces/enums';
import { UnauthorizedError } from '../errors';
import User from '../models/User';
import { createSearchQuery } from '../helpers/create-search-query';
import { reattachTokens } from '../helpers/re-attack-tokens';

export class CompanyService {
  req: Request;
  res?: Response;
  imageService: ImageService;
  userService: UserService;

  constructor(req: Request, res?: Response) {
    this.req = req;
    this.res = res;
    this.imageService = new ImageService(req);
    this.userService = new UserService(req, res!);
  }

  async createCompany() {
    const {
      name,
      phone,
      afm,
      address,
      founded,
      latitude,
      longitude,
      postmanRequest,
    } = this.req.body;
    const { files } = this.req;
    const { userId } = this.req.currentUser as IUserWithID;

    let newCompany = (await (
      await Company.create({
        name,
        phone,
        owner: userId,
        afm,
        address,
        founded,
        latitude,
        longitude,
      })
    ).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany;

    if (files?.image) {
      const logo = await this.imageService.handleSingleImage(
        files?.image as UploadedFile[]
      );

      newCompany = (await Company.findByIdAndUpdate(
        newCompany._id,
        {
          logo,
        },
        { new: true }
      ).populate({
        path: 'owner',
        select: 'firstName lastName email image _id role',
      })) as ICompany;
    }

    await User.findByIdAndUpdate(userId, {
      company: newCompany._id,
      role: Roles.OWNER,
    });

    await reattachTokens(
      this.res!,
      userId.toString() as string,
      postmanRequest || false
    );

    return (await Company.findById(newCompany._id).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany;
  }

  async updateCompany() {
    const { name, phone, afm, address, founded, latitude, longitude } =
      this.req.body;
    const { companyId } = this.req.params;
    const { files } = this.req;

    let updateCompany = (await Company.findByIdAndUpdate(
      companyId,
      {
        name,
        phone,
        afm,
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

    if (files?.image) {
      if (updateCompany?.logo !== DefaultImage.LOGO) {
        await this.imageService.deleteImages([updateCompany?.logo as string]);
      }
      const logo = await this.imageService.handleSingleImage(
        files?.image as UploadedFile[]
      );
      updateCompany = (await Company.findByIdAndUpdate(
        companyId,
        {
          logo,
        },
        { new: true }
      ).populate({
        path: 'owner',
        select: 'firstName lastName email image _id role',
      })) as ICompany;
    }

    return updateCompany;
  }

  async deleteCompany() {
    const { companyId } = this.req.params;
    const { postmanRequest } = this.req.body;
    const { userId } = this.req.currentUser as IUserWithID;

    const company = (await Company.findById(companyId)) as ICompany;
    const isOwner = company.owner._id.toString() === userId.toString();

    if (!isOwner) {
      throw new UnauthorizedError(
        'You are not authorized to perform this action!'
      );
    }

    await Company.findByIdAndDelete(companyId);

    if (company.logo !== DefaultImage.LOGO) {
      await this.imageService.deleteImages([company.logo as string]);
    }

    const employees = (await User.find({
      company: companyId,
    })) as IUser[];

    employees.forEach(async (emp) => {
      await User.findByIdAndUpdate(emp._id, {
        company: null,
        role: Roles.UNCATEGORIZED,
      });
    });

    await User.findByIdAndUpdate(userId, {
      company: null,
      role: Roles.UNCATEGORIZED,
    });

    await reattachTokens(
      this.res!,
      userId.toString() as string,
      postmanRequest || false
    );

    return `The ${company.name} company, has been deleted!`;
  }

  async getCompany() {
    const { companyId } = this.req.params;

    return await Company.findById(companyId).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });
  }

  async getCompanies() {
    const { page, searchString } = this.req.query;

    const limit = 10;
    const skip = (Number(page) - 1) * limit;

    const searchQuery = createSearchQuery<ICompany>(searchString as string, [
      'name',
      'phone',
    ]);

    return await Company.find(searchQuery).skip(skip).limit(limit).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });
  }

  async getEmployees() {
    const { companyId } = this.req.params;
    const { page, searchString } = this.req.query;

    const limit: number = 10;
    const skip: number = (Number(page) - 1) * limit;

    const searchQuery: FilterQuery<IUser> = createSearchQuery<IUser>(
      searchString as string,
      ['firstName', 'lastName']
    );

    const query: FilterQuery<IUser> = {
      ...searchQuery,
      company: companyId,
    };

    return await User.find(query)
      .skip(skip)
      .limit(limit)
      .select('-password -createdAt -updatedAt -company');
  }
}
