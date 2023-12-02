import { Request, Response } from 'express';
import { ICompany, IUserWithID } from '../interfaces/interfaces';
import Company from '../models/Company';
import { UserService } from './user-service';
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { DefaultImage, Roles } from '../interfaces/enums';
import { checkCoordinates } from '../helpers/check-coordinates';
import { ForbiddenError } from '../errors/forbidden';
import { UnauthorizedError } from '../errors';

export class CompanyService {
  req: Request;
  res?: Response;
  imageService: ImageService;
  userService: UserService;

  constructor(req: Request, res?: Response) {
    this.req = req;
    this.res = res;
    this.imageService = new ImageService(req);
    this.userService = new UserService(req);
  }

  async createCompany() {
    const { name, phone, afm, address, since, latitude, longitude } =
      this.req.body;

    const owner: mongoose.Types.ObjectId = (this.req.currentUser as IUserWithID)
      .userId;

    checkCoordinates(latitude, longitude);

    const image: string | undefined = await this.imageService.uploadSingleImage(
      this.req.files?.image as UploadedFile[]
    );
    const finalImage: string = image ? image : DefaultImage.LOGO;

    const company: ICompany = await (
      await Company.create({
        name,
        phone,
        owner,
        afm,
        address,
        since,
        latitude,
        longitude,
        logo: finalImage,
      })
    ).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });

    const userService: UserService = new UserService(this.req);

    await userService.changeUserRole(
      Roles.OWNER,
      this.req.currentUser?.userId.toString(),
      this.res,
      this.req.body.isFromPostMan
    );

    return company;
  }

  async updateCompany() {
    const { name, phone, afm, address, since, latitude, longitude } =
      this.req.body;
    const { id } = this.req.params;

    const company: ICompany | null = await Company.findById(id);

    checkCoordinates(latitude, longitude);

    let image: string | undefined;
    if (this.req.files) {
      image = await this.imageService.uploadSingleImage(
        this.req.files?.image as UploadedFile[]
      );
      if (company?.logo !== DefaultImage.PROFILE_IMAGE) {
        await this.imageService.deleteImage(company?.logo as string);
      }
    }

    await Company.findByIdAndUpdate(id, {
      name,
      phone,
      afm,
      address,
      since,
      latitude,
      longitude,
      logo: image,
    });

    return Company.findById(id)
      .populate({
        path: 'owner',
        select: 'firstName lastName email image _id role',
      })
      .populate({
        path: 'employees',
        select: 'firstName lastName email image _id role',
      });
  }

  async deleteCompany() {
    const { id } = this.req.params;

    const company: ICompany | null = await Company.findById(id);

    if (
      company?.owner._id.toString() !== this.req.currentUser?.userId.toString()
    ) {
      throw new UnauthorizedError(
        'You are not authorized to perform this action!'
      );
    }

    await Company.findByIdAndDelete(id);

    if (company?.logo !== DefaultImage.LOGO) {
      await this.imageService.deleteImage(company?.logo as string);
    }

    company?.employees.forEach(async (employ) => {
      await this.userService.changeUserRole(
        Roles.UNCATEGORIZED,
        employ._id.toString()
      );
    });

    await this.userService.changeUserRole(
      Roles.UNCATEGORIZED,
      this.req.currentUser?.userId.toString(),
      this.res,
      this.req.body.isFromPostMan
    );

    return `The ${company?.name} company, has been deleted.`;
  }

  async getCompany() {
    const { id } = this.req.params;
    return await Company.findById(id)
      .populate({
        path: 'owner',
        select: 'firstName lastName email image _id role',
      })
      .populate({
        path: 'employees',
        select: 'firstName lastName email image _id role',
      });
  }

  async getCompanies() {
    const { page } = this.req.query;

    const limit: number = 10;
    const skip: number = (Number(page) - 1) * limit;

    return await Company.find({})
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'owner',
        select: 'firstName lastName email image _id role',
      })
      .populate({
        path: 'employees',
        select: 'firstName lastName email image _id role',
      });
  }

  async addEmploy() {
    const { userId, role } = this.req.body;
    const { id } = this.req.params;

    if (role! === Roles.OWNER) {
      throw new ForbiddenError('You can not make an employ owner!');
    }

    const company: ICompany | null = await Company.findById(id);

    company?.employees.push(userId);
    await company?.save();

    await this.userService.changeUserRole(role || Roles.EMPLOY, userId);

    return `Employ has been added to the ${company?.name} company with role: ${
      role || Roles.EMPLOY
    }`;
  }

  async removeEmploy() {
    const { userId } = this.req.body;
    const { id } = this.req.params;

    const company: ICompany | null = await Company.findById(id);
    const employeeIndex: number | undefined =
      company?.employees.indexOf(userId);

    if (employeeIndex! > -1) {
      company?.employees.splice(employeeIndex!, 1);
      await company?.save();
    }

    await this.userService.changeUserRole(Roles.UNCATEGORIZED, userId);

    return `Employ has been removed from the ${company?.name} company!`;
  }
}
