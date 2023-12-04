import { Request, Response } from 'express';
import { ICompany, IUser, IUserWithID } from '../interfaces/interfaces';
import Company from '../models/Company';
import { UserService } from './user-service';
import mongoose, { FilterQuery } from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { DefaultImage, Roles } from '../interfaces/enums';
import { BadRequestError, UnauthorizedError } from '../errors';
import User from '../models/User';

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

    const owner: mongoose.Types.ObjectId = userId;

    const companyByAFK: ICompany | null = await Company.findOne({ afm });
    const companyByPhone: ICompany | null = await Company.findOne({ phone });
    if (companyByAFK) {
      throw new BadRequestError('AFM already in user');
    }
    if (companyByPhone) {
      throw new BadRequestError('Phone already in user');
    }

    const logo: string | undefined = await this.imageService.handleSingleImage(
      files?.image as UploadedFile[],
      DefaultImage.LOGO
    );

    const company: ICompany = await (
      await Company.create({
        name,
        phone,
        owner,
        afm,
        address,
        founded,
        latitude,
        longitude,
        logo,
      })
    ).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });

    await User.findByIdAndUpdate(userId, {
      company: company._id,
    });

    await this.userService.changeUserRole(
      Roles.OWNER,
      userId.toString(),
      this.res,
      postmanRequest
    );

    return (await Company.findById(company._id).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany;
  }

  async updateCompany() {
    const { name, phone, afm, address, founded, latitude, longitude } =
      this.req.body;
    const { companyId } = this.req.params;
    const { files } = this.req;

    const company: ICompany | null = (await Company.findById(
      companyId
    )) as ICompany;

    const companyByAFK: ICompany | null = await Company.findOne({ afm });
    const companyByPhone: ICompany | null = await Company.findOne({ phone });
    if (companyByAFK && company.afm !== companyByAFK.afm) {
      throw new BadRequestError('AFM already in user');
    }
    if (companyByPhone && company.phone !== companyByPhone.phone) {
      throw new BadRequestError('Phone already in user');
    }

    let logo: string | undefined;
    if (files) {
      if (company?.logo !== DefaultImage.PROFILE_IMAGE) {
        await this.imageService.deleteImages([company?.logo as string]);
      }
      logo = await this.imageService.handleSingleImage(
        files?.image as UploadedFile[]
      );
    }

    await Company.findByIdAndUpdate(companyId, {
      name,
      phone,
      afm,
      address,
      founded,
      latitude,
      longitude,
      logo,
    });

    return (await Company.findById(companyId).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany;
  }

  async deleteCompany() {
    const { companyId } = this.req.params;
    const { postmanRequest } = this.req.body;
    const { userId } = this.req.currentUser as IUserWithID;

    const company: ICompany = (await Company.findById(companyId)) as ICompany;
    const isOwner: boolean = company.owner._id.toString() === userId.toString();

    if (!isOwner) {
      throw new UnauthorizedError(
        'You are not authorized to perform this action!'
      );
    }

    await Company.findByIdAndDelete(companyId);

    if (company.logo !== DefaultImage.LOGO) {
      await this.imageService.deleteImages([company.logo as string]);
    }

    const employees: IUser[] = (await User.find({
      company: companyId,
    })) as IUser[];

    employees.forEach(async (emp) => {
      await this.userService.changeUserRole(
        Roles.UNCATEGORIZED,
        emp._id.toString()
      );
    });

    await this.userService.changeUserRole(
      Roles.UNCATEGORIZED,
      userId.toString(),
      this.res,
      postmanRequest
    );

    return `The ${company.name} company, has been deleted.`;
  }

  async getCompany() {
    const { companyId } = this.req.params;

    return (await Company.findById(companyId).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany;
  }

  async getCompanies() {
    const { page, searchString } = this.req.query;

    const limit: number = 10;
    const skip: number = (Number(page) - 1) * limit;

    let query: FilterQuery<IUser> = {};

    if (typeof searchString === 'string' && searchString.trim() !== '') {
      const searchRegex: RegExp = new RegExp(searchString.trim(), 'i');
      query = {
        $or: [{ name: { $regex: searchRegex } }],
      };
    }

    return (await Company.find(query).skip(skip).limit(limit).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    })) as ICompany[];
  }

  async getEmployees() {
    const { companyId } = this.req.params;
    const { page } = this.req.query;

    const limit: number = 10;
    const skip: number = (Number(page) - 1) * limit;

    return (await User.find({
      company: companyId,
    })
      .skip(skip)
      .limit(limit)
      .select('-password -createdAt -updatedAt -company')) as IUser[];
  }
}
