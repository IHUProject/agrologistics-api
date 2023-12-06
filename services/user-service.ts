import { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../errors';
import User from '../models/User';
import { IUser, IUserWithID } from '../interfaces/interfaces';
import { ImageService } from './image-service';
import { UploadedFile } from 'express-fileupload';
import { DefaultImage, Roles } from '../interfaces/enums';
import { reattachTokens } from '../helpers/re-attack-tokens';
import { ForbiddenError } from '../errors/forbidden';
import { createSearchQuery } from '../helpers/create-search-query';

export class UserService {
  private req: Request;
  private res: Response;
  private imageService: ImageService;

  constructor(req: Request, res: Response) {
    this.req = req;
    this.res = res;
    this.imageService = new ImageService(req);
  }

  getCurrentUser() {
    return this.req.currentUser as IUserWithID;
  }

  async deleteUser() {
    const { userId } = this.req.params;
    const { role } = this.req.currentUser as IUserWithID;

    if (role === Roles.OWNER) {
      throw new ForbiddenError(
        'Please delete your company to proceed to this action!'
      );
    }

    const user = (await User.findByIdAndDelete(userId)) as IUser;

    if (user.image !== DefaultImage.PROFILE_IMAGE) {
      await this.imageService.deleteImages([user.image as string]);
    }

    this.res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
      secure: true,
      sameSite: 'none',
      signed: true,
    });

    return `The user ${user.firstName} ${user.lastName}, has been deleted.`;
  }

  async updateUser() {
    const { userId } = this.req.params;
    const { firstName, lastName, email, postmanRequest } = this.req.body;
    const { currentUser } = this.req;
    const { files } = this.req;

    let updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
      },
      { new: true, runValidators: true }
    );

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
      );
    }

    await reattachTokens(
      this.res!,
      currentUser?.userId.toString() as string,
      postmanRequest || false
    );

    return (await User.findById(userId)
      .select('-createAt -updateAt -password')
      .populate({
        path: 'company',
        select: 'name',
      })) as IUser;
  }

  async getUsers() {
    const { page, searchString } = this.req.query;

    const limit = 10;
    const skip = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<IUser>(searchString as string, [
      'firstName',
      'lastName',
    ]);

    return (await User.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .select('-password -createdAt -updatedAt')
      .populate({
        path: 'company',
        select: 'name',
      })) as IUser[];
  }

  async getSingleUser(): Promise<IUser> {
    const { userId } = this.req.params;

    return (await User.findById(userId)
      .select('-password -createdAt -updatedAt')
      .populate({
        path: 'company',
        select: 'name',
      })) as IUser;
  }

  async changePassword() {
    const { userId } = this.req.params;
    const { oldPassword, newPassword } = this.req.body;

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

  async changeUserRole() {
    const { userId } = this.req.params;
    const { role } = this.req.body;

    const user = (await User.findById(userId)) as IUser;
    const { company } = this.req.currentUser as IUserWithID;
    if (user.company.toString() !== company.toString()) {
      throw new UnauthorizedError("You can not change this user's role");
    }
    if (user.role === Roles.OWNER) {
      throw new BadRequestError('You can not change the owners role!');
    }

    user.role = role;
    await user.save();

    return `Role change to ${user?.role}`;
  }

  async addToCompany() {
    const { userId } = this.req.params;
    const { companyId, role } = this.req.body;

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

  async removeFromCompany() {
    const { userId } = this.req.params;
    const { company } = this.req.currentUser as IUserWithID;

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

    return 'User has been removed for the company!';
  }
}
