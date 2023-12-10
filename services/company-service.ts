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
  private imageService: ImageService;
  private userService: UserService;

  constructor() {
    this.imageService = new ImageService();
    this.userService = new UserService();
  }

  public async createCompany(req: Request, res: Response) {
    const {
      name,
      phone,
      afm,
      address,
      founded,
      latitude,
      longitude,
      postmanRequest,
    } = req.body;
    const { files } = req;
    const { userId } = req.currentUser as IUserWithID;

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
        { new: true, runValidators: true }
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
      res,
      userId.toString() as string,
      postmanRequest || false
    );

    return (await Company.findById(newCompany._id).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany;
  }

  public async updateCompany(req: Request) {
    const { name, phone, afm, address, founded, latitude, longitude } =
      req.body;
    const { companyId } = req.params;
    const { files } = req;

    let updatedCompany = (await Company.findByIdAndUpdate(
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
      if (updatedCompany?.logo !== DefaultImage.LOGO) {
        await this.imageService.deleteImages([updatedCompany?.logo as string]);
      }
      const logo = await this.imageService.handleSingleImage(
        files?.image as UploadedFile[]
      );
      updatedCompany = (await Company.findByIdAndUpdate(
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

    return updatedCompany;
  }

  public async deleteCompany(req: Request, res: Response) {
    const { companyId } = req.params;
    const { postmanRequest } = req.body;
    const { userId } = req.currentUser as IUserWithID;

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
    console.log(employees);

    employees.forEach(async (emp) => {
      await User.findByIdAndUpdate(emp._id, {
        company: null,
        role: Roles.UNCATEGORIZED,
      });
    });

    await reattachTokens(
      res,
      userId.toString() as string,
      postmanRequest || false
    );

    return `The ${company.name} company, has been deleted!`;
  }

  async getCompany(req: Request) {
    const { companyId } = req.params;

    return await Company.findById(companyId).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });
  }

  async getCompanies(req: Request) {
    const { page, searchString } = req.query;

    const limit = 10;
    const skip = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<ICompany>(searchString as string, [
      'name',
      'phone',
    ]);

    return await Company.find(searchQuery).skip(skip).limit(limit).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });
  }

  async getEmployees(req: Request) {
    const { companyId } = req.params;
    const { page, searchString } = req.query;

    const limit: number = 10;
    const skip: number = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<IUser>(searchString as string, [
      'firstName',
      'lastName',
    ]);

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
