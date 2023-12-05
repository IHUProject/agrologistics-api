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

    const user = await User.findOne({ email });
    if (user && user.email !== currentUser?.email) {
      throw new BadRequestError('Email is already in use');
    }

    let image: string | undefined;
    if (files) {
      if (currentUser?.image !== DefaultImage.PROFILE_IMAGE) {
        await this.imageService.deleteImages([currentUser?.image as string]);
      }
      image = await this.imageService.handleSingleImage(
        files?.image as UploadedFile[]
      );
    }

    await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      image,
      email,
    });

    await reattachTokens(
      this.res!,
      currentUser?.userId.toString() as string,
      postmanRequest || false
    );

    return (await User.findById(userId).select(
      '-createAt -updateAt -password'
    )) as IUser;
  }

  async getUsers() {
    const { page, searchString } = this.req.query;

    const limit = 10;
    const skip = (Number(page) - 1) * limit;

    const searchQuery = createSearchQuery<IUser>(searchString as string, [
      'firstName',
      'lastName',
    ]);

    return await User.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .select('-password -createdAt -updatedAt');
  }

  async getSingleUser(): Promise<IUser> {
    const { userId } = this.req.params;

    return await User.findById(userId).select(
      '-password -createdAt -updatedAt'
    );
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

  async changeUserRole(
    newRole?: Roles,
    id?: string,
    res?: Response,
    postmanRequest?: boolean
  ) {
    const { role } = this.req.body;
    const { userId } = this.req.params;

    const user = (await User.findById(id || userId)) as IUser;
    if (role && userId && !id && !newRole) {
      const { company } = this.req.currentUser as IUserWithID;
      if (user.company.toString() !== company.toString()) {
        throw new UnauthorizedError("You can not change this user's role");
      }
      if (user.role === Roles.OWNER) {
        throw new BadRequestError('You can not change the owners role!');
      }
      if (userId && !role) {
        throw new BadRequestError('Please provide role');
      }
    }

    user.role = newRole || role;
    await user.save();

    if (res) {
      await reattachTokens(
        res!,
        this.req.currentUser?.userId.toString() as string,
        postmanRequest || false
      );
    }

    return `Role change to ${user?.role}`;
  }

  async addToCompany() {
    const { userId } = this.req.params;
    const { companyId, role } = this.req.body;

    const user = (await User.findById(userId)) as IUser;

    if (user.company) {
      throw new BadRequestError('User working elsewhere!');
    }

    user.role = role || Roles.EMPLOY;
    user.company = companyId;
    await user.save();

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

    await this.changeUserRole(Roles.UNCATEGORIZED, userId);
    await User.findByIdAndUpdate(userId, {
      company: null,
    });

    return 'User has been removed for the company!';
  }
}
