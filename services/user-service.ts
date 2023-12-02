import { Request, Response } from 'express';
import { BadRequestError } from '../errors';
import User from '../models/User';
import { ICompany, IUser, IUserWithID } from '../interfaces/interfaces';
import { ImageService } from './image-service';
import { UploadedFile } from 'express-fileupload';
import { DefaultImage, Roles } from '../interfaces/enums';
import { reattachTokens } from '../helpers/re-attack-tokens';
import { ForbiddenError } from '../errors/forbidden';
import Company from '../models/Company';

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

    if (this.req.currentUser?.role === Roles.OWNER) {
      throw new ForbiddenError(
        'Please delete your company to proceed to this action!'
      );
    }

    const user: IUser | null = await User.findByIdAndDelete(id);

    if (user?.image !== DefaultImage.PROFILE_IMAGE) {
      await this.imageService.deleteImage(user?.image as string);
    }

    return `The user ${user?.firstName} ${user?.lastName}, has been deleted.`;
  }

  async updateUser() {
    const { id } = this.req.params;
    const { firstName, lastName, email } = this.req.body;

    const user: IUser | null = await User.findOne({ email });

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
      throw new BadRequestError('Passwords does not match!');
    }

    user!.password = newPassword;
    await user?.save();

    return 'Password has been change!';
  }

  async changeUserRole(
    newRole?: Roles,
    idProp?: string,
    res?: Response,
    isFromPostMan?: boolean
  ) {
    const { role } = this.req.body;
    const { id } = this.req.params;

    if (role && id && !idProp && !newRole) {
      const company: ICompany | null = await Company.findOne({
        $or: [{ owner: id }, { employees: { $in: [id] } }],
      });

      const companyCurrentUser: ICompany | null = await Company.findOne({
        $or: [
          { owner: this.req.currentUser?.userId },
          { employees: { $in: [this.req.currentUser?.userId] } },
        ],
      });

      if (company?._id.toString() !== companyCurrentUser?._id.toString()) {
        throw new ForbiddenError('This employ belongs to other company!');
      }
    }

    const user: IUser | null = await User.findById(idProp || id);
    user!.role = newRole ? newRole : role;
    await user?.save();

    if (res) {
      await reattachTokens(
        res!,
        this.req.currentUser?.userId.toString() as string,
        isFromPostMan ? true : false
      );
    }

    return `Role change to ${user?.role}`;
  }
}
