import { Request } from 'express';
import { BadRequestError } from '../errors';
import User from '../models/User';
import { IUser, IUserWithID } from '../interfaces/interfaces';
import { ImageService } from './image-service';
import { UploadedFile } from 'express-fileupload';
import { DefaultImage, Roles } from '../interfaces/enums';

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
    const { id } = this.req.params;

    const user: IUser | null = await User.findByIdAndDelete(id);

    if (user?.image !== DefaultImage.PROFILE_IMAGE) {
      await this.imageService.deleteImage(user?.image as string);
    }

    return `User with ID: ${user?._id}, name: ${user?.firstName} and last name: ${user?.lastName}, has been deleted.`;
  }

  async updateUser() {
    const { id } = this.req.params;
    const { firstName, lastName, email } = this.req.body;

    const user: IUser | null = await User.findOne({ email });

    if (user && user.email !== email) {
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
      if (user?.image !== DefaultImage.PROFILE_IMAGE) {
        await this.imageService.deleteImage(user?.image as string);
      }
    }

    await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
      image,
      email,
    });

    return (await User.findById(id).select(
      '-password -createdAt -updatedAt'
    )) as IUser;
  }

  async getAllUsers() {
    const { page } = this.req.query;

    const limit: number = 10;
    const skip: number = (Number(page) - 1) * limit;

    return await User.find({})
      .skip(skip)
      .limit(limit)
      .select('-password -createdAt -updatedAt');
  }

  async getSingleUser(): Promise<IUser> {
    const { id } = this.req.params;

    return await User.findById(id).select('-password -createdAt -updatedAt');
  }

  async changePassword() {
    const { id } = this.req.params;
    const { oldPassword, newPassword } = this.req.body;

    const user: IUser | null = await User.findById(id);

    const isMatch: boolean | undefined = await user?.comparePassword(
      oldPassword
    );
    if (!isMatch) {
      throw new BadRequestError('Wrong password!');
    }

    user!.password = newPassword;
    await user?.save();

    return 'Password has been change';
  }

  async changeUserRole(newRole?: Roles) {
    const { role } = this.req.body;

    const user: IUser | null = await User.findById(
      this.req.currentUser?.userId
    );
    user!.role = newRole ? newRole : role;
    await user?.save();

    return `Role change to ${user?.role}`;
  }
}
