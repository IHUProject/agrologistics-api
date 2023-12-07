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
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  public getCurrentUser(req: Request) {
    return req.currentUser as IUserWithID;
  }

  public async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const { role } = req.currentUser as IUserWithID;

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

  public async updateUser(req: Request, res: Response) {
    const { userId } = req.params;
    const { firstName, lastName, email, postmanRequest } = req.body;
    const { currentUser } = req;
    const { files } = req;

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
      res,
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

  public async getUsers(req: Request) {
    const { page, searchString } = req.query;

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

  public async getSingleUser(req: Request): Promise<IUser> {
    const { userId } = req.params;

    return (await User.findById(userId)
      .select('-password -createdAt -updatedAt')
      .populate({
        path: 'company',
        select: 'name',
      })) as IUser;
  }

  async changePassword(req: Request) {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

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

  async changeUserRole(req: Request) {
    const { userId } = req.params;
    const { role } = req.body;

    const user = (await User.findById(userId)) as IUser;
    const { company } = req.currentUser as IUserWithID;
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

  async addToCompany(req: Request) {
    const { userId } = req.params;
    const { companyId, role } = req.body;

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

  async removeFromCompany(req: Request) {
    const { userId } = req.params;
    const { company } = req.currentUser as IUserWithID;

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
