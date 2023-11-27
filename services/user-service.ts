import { Request } from 'express';
import { BadRequestError, NotFoundError } from '../errors';
import User from '../models/User';
import { IUser, IUserWithID } from '../interfaces/interfaces';
import { ImageService } from './image-service';
import { UploadedFile } from 'express-fileupload';

export class UserService {
  private req: Request;
  private imageService: ImageService;

  constructor(req: Request) {
    this.req = req;
    this.imageService = new ImageService(req);
  }

  getCurrentUser() {
    return this.req.currentUser as IUserWithID;
  }

  async deleteUser() {
    const user: IUser | null = await User.findByIdAndDelete(this.req.params.id);
    return `User with ID: ${user?._id}, name: ${user?.firstName} and last name: ${user?.lastName}, has been deleted.`;
  }

  async updateUser() {
    const { id } = this.req.params;
    const { firstName, lastName, email } = this.req.body;

    const isEmailExists: boolean = (await User.findOne({ email }))
      ? true
      : false;

    if (isEmailExists) {
      throw new BadRequestError('E-mail is already in use!');
    }
    if (this.req.body.role) {
      throw new BadRequestError('You are not allowed to change your role!');
    }
    if (this.req.body.password) {
      throw new BadRequestError('You are not allowed to change your password!');
    }

    let image: string | undefined;
    if (this.req.files) {
      image = await this.imageService.uploadSingleImage(
        this.req.files?.image as UploadedFile[]
      );
    }

    const user: IUser = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
      image,
      email,
    }).select('-password -__v -createdAt -updatedAt');

    return user;
  }

  async getAllUsers() {
    const { page } = this.req.query;

    if (page && isNaN(Number(page))) {
      throw new BadRequestError('Page number must be a valid number');
    }

    const pageNumber: number = Number(page) || 1;

    if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
      throw new BadRequestError('Page number must be a positive safe integer');
    }

    const limit: number = 10;
    const skip: number = (Number(pageNumber) - 1) * limit;

    return await User.find({})
      .skip(skip)
      .limit(limit)
      .select('-password  -__v -createdAt -updatedAt');
  }

  async getSingleUser() {
    const { id } = this.req.params;

    const user: IUser = await User.findById(id).select(
      '-password -__v -createdAt -updatedAt'
    );

    if (!user) {
      throw new NotFoundError('Users does not exit');
    }

    return user;
  }
}
