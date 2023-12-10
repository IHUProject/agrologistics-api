import { Response } from 'express';
import {
  ICompany,
  IPayload,
  IUser,
  IUserWithID,
} from '../interfaces/interfaces';
import Company from '../models/Company';
import { FilterQuery } from 'mongoose';
import { FileArray, UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { DefaultImage, Roles } from '../interfaces/enums';
import { UnauthorizedError } from '../errors';
import User from '../models/User';
import { createSearchQuery } from '../helpers/create-search-query';
import { reattachTokens } from '../helpers/re-attack-tokens';

export class CompanyService {
  private imageService: ImageService;
  constructor() {
    this.imageService = new ImageService();
  }

  public async createCompany(
    payload: IPayload<ICompany>,
    files: FileArray | null | undefined,
    currentUser: IUserWithID,
    res: Response
  ) {
    const { name, phone, afm, address, founded, latitude, longitude } =
      payload.data;
    const { postmanRequest } = payload;
    const { userId } = currentUser as IUserWithID;

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

  public async updateCompany(
    payload: IPayload<ICompany>,
    files: FileArray | null | undefined,
    companyId: string
  ) {
    const { name, phone, afm, address, founded, latitude, longitude } =
      payload.data;

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

  public async deleteCompany(
    companyId: string,
    postmanRequest: boolean,
    currentUser: IUserWithID,
    res: Response
  ) {
    const { userId } = currentUser as IUserWithID;
    const company = (await Company.findById(companyId)) as ICompany;
    const isOwner = company.owner._id.toString() === userId.toString();

    if (!isOwner) {
      throw new UnauthorizedError(
        'You are not authorized to perform this action!'
      );
    }

    await Company.findByIdAndDelete(companyId);

    if (company.logo !== DefaultImage.LOGO) {
      await this.imageService.deleteImages([company.logo]);
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

    await reattachTokens(
      res,
      userId.toString() as string,
      postmanRequest || false
    );

    return `The ${company.name} company, has been deleted!`;
  }

  async getCompany(companyId: string) {
    return await Company.findById(companyId).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });
  }

  async getCompanies(page: string, searchString: string) {
    const limit = 10;
    const skip = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<ICompany>(searchString as string, [
      'name',
    ]);

    return await Company.find(searchQuery).skip(skip).limit(limit).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });
  }

  async getEmployees(
    companyId: string,
    page: string,
    searchString: string,
    currentUser: IUserWithID
  ) {
    const { company } = currentUser;
    const limit: number = 10;
    const skip: number = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<IUser>(searchString as string, [
      'firstName',
      'lastName',
    ]);

    let selectQuery = '-password -createdAt -updatedAt -company -phone';
    if (company.toString() === companyId) {
      selectQuery = '-password -createdAt -updatedAt -company';
    }

    const query: FilterQuery<IUser> = {
      ...searchQuery,
      company: companyId,
    };

    return await User.find(query).skip(skip).limit(limit).select(selectQuery);
  }
}
