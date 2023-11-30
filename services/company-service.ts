import { Request } from 'express';
import { ICompany, IUserWithID } from '../interfaces/interfaces';
import Company from '../models/Company';
import { UserService } from './user-service';
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { DefaultImage, Roles } from '../interfaces/enums';
import { BadRequestError } from '../errors';

export class CompanyService {
  req: Request;
  constructor(req: Request) {
    this.req = req;
  }

  async createCompany() {
    const { name, phone, afm, address, since, latitude, longitude } =
      this.req.body;
    const owner: mongoose.Types.ObjectId = (this.req.currentUser as IUserWithID)
      .userId;

    if (latitude && !longitude) {
      throw new BadRequestError('Add longitude!');
    }

    if (!latitude && longitude) {
      throw new BadRequestError('Add latitude!');
    }

    const userService: UserService = new UserService(this.req);
    await userService.changeUserRole(Roles.OWNER);

    const imageService: ImageService = new ImageService(this.req);
    const image: string | undefined = await imageService.uploadSingleImage(
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

    return company;
  }

  updateCompany() {}

  deleteCompany() {}

  getCompany() {}

  async getCompanies() {
    const { page } = this.req.query;

    const limit: number = 10;
    const skip: number = (Number(page) - 1) * limit;

    return await Company.find({}).skip(skip).limit(limit).populate({
      path: 'owner',
      select: 'firstName lastName email image _id role',
    });
  }
}
