import { Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../errors';
import User from '../models/User';
import {
  IPasswordPayload,
  IPayload,
  IUser,
  IUserWithID,
} from '../interfaces/interfaces';
import { ImageService } from './image-service';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { DefaultImage, Roles } from '../interfaces/enums';
import { reattachTokens } from '../helpers/re-attack-tokens';
import { ForbiddenError } from '../errors/forbidden';
import { createSearchQuery } from '../helpers/create-search-query';

export class UserService {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  public async deleteUser(userId: string, role: Roles, res: Response) {
    if (role === Roles.OWNER) {
      throw new ForbiddenError(
        'Please delete your company to proceed to this action!'
      );
    }

    const user = (await User.findByIdAndDelete(userId)) as IUser;

    if (user.image !== DefaultImage.PROFILE_IMAGE) {
      await this.imageService.deleteImages([user.image as string]);
    }

    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
      secure: true,
      sameSite: 'none',
      signed: true,
    });

    return `The user ${user.firstName} ${user.lastName}, has been deleted.`;
  }

  public async updateUser(
    payload: IPayload<IUser>,
    userId: string,
    files: fileUpload.FileArray | null | undefined,
    res: Response
  ) {
    const { firstName, lastName, email, phone } = payload.data;
    const { postmanRequest } = payload;

    let updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone,
      },
      { new: true, runValidators: true }
    )
      .select('-password -createdAt -updatedAt')
      .populate({
        path: 'company',
        select: '_id name',
      });

    let image: string | undefined;
    if (files?.image) {
      if (updatedUser?.image !== DefaultImage.PROFILE_IMAGE) {
        await this.imageService.deleteImages([updatedUser?.image as string]);
      }
      image = await this.imageService.handleSingleImage(
        files?.image as UploadedFile[]
      );
      updatedUser = await User.findByIdAndUpdate(
        updatedUser?._id,
        {
          image,
        },
        { new: true, runValidators: true }
      )
        .select('-password -createdAt -updatedAt')
        .populate({
          path: 'company',
          select: '_id name',
        });
    }

    await reattachTokens(res, userId, postmanRequest || false);

    return updatedUser;
  }

  public async getUsers(page: string, searchString: string) {
    const limit = 10;
    const skip = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<IUser>(searchString as string, [
      'firstName',
      'lastName',
    ]);

    return (await User.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .select('-password -createdAt -updatedAt -phone')
      .populate({
        path: 'company',
        select: 'name',
      })) as IUser[];
  }

  public async getSingleUser(userId: string): Promise<IUser> {
    return (await User.findById(userId)
      .select('-password -createdAt -updatedAt -phone')
      .populate({
        path: 'company',
        select: 'name',
      })) as IUser;
  }

  async changePassword(userId: string, payload: IPasswordPayload) {
    const { oldPassword, newPassword } = payload;

    const user = (await User.findById(userId)) as IUser;

    const isMatch: boolean | undefined = await user?.comparePassword(
      oldPassword
    );
    if (!isMatch) {
      throw new BadRequestError('Passwords does not match!');
    }

    user.password = newPassword;
    await user.save();

    return 'Password has been change!';
  }

  async changeUserRole(
    userId: string,
    payload: IPayload<IUser>,
    currentUser: IUserWithID
  ) {
    const { role } = payload.data;

    const user = (await User.findById(userId)) as IUser;
    const { company } = currentUser;
    if (user.company.toString() !== company.toString()) {
      throw new UnauthorizedError("You can not change this user's role");
    }
    if (user.role === Roles.OWNER) {
      throw new BadRequestError('You can not change the owners role!');
    }

    user.role = role;
    await user.save();

    return `The role of employ ${user.firstName} ${user.lastName} has been changed to ${user?.role}`;
  }

  async addToCompany(userId: string, role: Roles, companyId: string) {
    if (role && role === Roles.OWNER) {
      throw new BadRequestError('You can not make an employ owner!');
    }

    const user = (await User.findById(userId)) as IUser;
    if (user.company) {
      throw new BadRequestError('User working elsewhere!');
    }

    await User.findByIdAndUpdate(
      userId,
      {
        company: companyId,
        role: role || Roles.EMPLOY,
      },
      { runValidators: true }
    );

    return `The user ${user.firstName} ${
      user.lastName
    } has been add to the company with as ${role || Roles.EMPLOY}`;
  }

  async removeFromCompany(userId: string, currentUser: IUserWithID) {
    const { company } = currentUser;

    const user = (await User.findById(userId)) as IUser;
    if (!user.company) {
      throw new BadRequestError('User does not work anywhere!');
    }
    if (user.company.toString() !== company.toString()) {
      throw new ForbiddenError('You don not belong at the same company');
    }

    await User.findByIdAndUpdate(userId, {
      company: null,
      role: Roles.UNCATEGORIZED,
    });

    return `The employ ${user.firstName} ${user.lastName} has been removed for the company!`;
  }
}
