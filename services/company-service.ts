import { Request, Response } from 'express';
import { ICompany, IUserWithID } from '../interfaces/interfaces';
import Company from '../models/Company';
import { UserService } from './user-service';
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { DefaultImage, Roles } from '../interfaces/enums';
import { checkCoordinates } from '../helpers/check-coordinates';
import { BadRequestError } from '../errors';
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
    this.userService = new UserService(req);
  }

  async createCompany() {
    const { name, phone, afm, address, since, latitude, longitude } =
      this.req.body;
    const owner: mongoose.Types.ObjectId = (this.req.currentUser as IUserWithID)
      .userId;

    checkCoordinates(latitude, longitude);

    const userService: UserService = new UserService(this.req);
    console.log(this.req.currentUser?.userId.toString());

    await userService.changeUserRole(
      Roles.OWNER,
      this.req.currentUser?.userId.toString()
    );

    reattachTokens(
      this.res!,
      this.req.currentUser?.userId.toString() as string,
      this.req.body.isFromPostMan
    );

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

    const company: ICompany | null = await Company.findByIdAndDelete(id);

    if (company?.logo !== DefaultImage.LOGO) {
      await this.imageService.deleteImage(company?.logo as string);
    }

    const companies: ICompany[] = await this.getCompanies();

    const ids: string[] = companies.map((company) =>
      company.owner._id.toString()
    );

    const ownsOtherCompanies: boolean = ids.some(
      (id) => id === this.req.currentUser?.userId.toString()
    );

    if (!ownsOtherCompanies) {
      this.userService.changeUserRole(
        Roles.UNCATEGORIZED,
        this.req.currentUser?.userId.toString()
      );

      reattachTokens(
        this.res!,
        this.req.currentUser?.userId.toString() as string,
        this.req.body.isFromPostMan
      );
    }

    return `Company with ID: ${company?._id}, name: ${company?.name} and AFM: ${company?.afm}, has been deleted.`;
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

    const company: ICompany | null = await Company.findById(id);

    company?.employees.push(userId);
    await company?.save();

    this.userService.changeUserRole(role || Roles.EMPLOY, userId);

    return `A user with ID: ${userId} added to the company (${
      company?.name
    } with role: ${role || Roles.EMPLOY})`;
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
    } else {
      throw new BadRequestError('This user does not exist to this company!');
    }

    this.userService.changeUserRole(Roles.UNCATEGORIZED, userId);

    return `Employ with ID:${userId} has been removed!`;
  }
}
