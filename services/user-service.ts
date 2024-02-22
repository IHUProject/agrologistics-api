import { BadRequestError } from '../errors';
import User from '../models/User';
import { IDataImgur, IPasswordPayload, IUser } from '../interfaces/interfaces';
import { ImageService } from './general-services/image-service';
import { Roles } from '../interfaces/enums';
import { ForbiddenError } from '../errors/forbidden';
import Company from '../models/Company';
import { createTokenUser } from '../helpers/create-token-user';
import { DataLayerService } from './general-services/data-layer-service';
import { Types } from 'mongoose';

export class UserService extends DataLayerService<IUser> {
  private imageService: ImageService;
  private select: string;
  private searchFields: string[];

  constructor() {
    super(User);
    this.select = '-password -createdAt -updatedAt';
    this.imageService = new ImageService();
    this.searchFields = ['firstName', 'lastName', 'role'];
  }

  public async deleteUser(
    userId: string,
    isExternalRequest: boolean = false,
    userInfo?: IUser
  ) {
    const user = !userInfo ? await this.getOne(userId) : userInfo;

    const { role, company } = user;
    if (role === Roles.OWNER && !isExternalRequest) {
      throw new ForbiddenError(
        'Please delete your company to proceed to this action!'
      );
    }

    await Company.updateOne({ _id: company }, { $pull: { employees: userId } });

    const { deletehash } = user.image;
    if (deletehash) {
      await this.imageService.deleteSingleImage(deletehash);
    }

    return await this.delete(userId);
  }

  public async updateUser(
    payload: IUser,
    userId: string,
    file: Express.Multer.File | undefined
  ) {
    await super.validateData(payload);

    let user = await this.getOne(userId);
    let image: IDataImgur | undefined;

    if (file) {
      const { deletehash } = user.image;
      if (deletehash) {
        await this.imageService.deleteSingleImage(deletehash);
      }
      image = await this.imageService.handleSingleImage(file);
    }

    user = await this.update(userId, { ...payload, image }, this.select);

    return createTokenUser(user);
  }

  public async getUsers(page: string, searchString: string, limit: string) {
    return await this.getMany(
      page,
      searchString,
      this.select,
      this.searchFields,
      [],
      isNaN(Number(limit)) ? 10 : Number(limit)
    );
  }

  public async getSingleUser(userId: string) {
    return await this.getOne(userId, this.select);
  }

  public async changePassword(userId: string, payload: IPasswordPayload) {
    const { oldPassword, newPassword } = payload;
    const user = await this.getOne(userId);
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      throw new BadRequestError('Passwords does not match!');
    }

    user.password = newPassword;
    await user.save();

    return 'Password has been change!';
  }

  public async createUser(
    payload: IUser,
    file: Express.Multer.File | undefined
  ) {
    await super.validateData(payload);

    const image = await this.imageService.handleSingleImage(file);
    const user = await super.create({
      ...payload,
      image,
    });
    const { _id, company } = user;

    await Company.updateOne({ _id: company }, { $push: { employees: _id } });

    return await this.getOne(user._id, this.select);
  }

  public async changeUserRole(
    userId: string,
    role: Roles,
    isExternalRequest: boolean = false
  ) {
    const user = await this.getOne(userId);

    if (user.role === Roles.OWNER) {
      throw new BadRequestError('You can not change the owners role!');
    }
    if (user.role === Roles.UNCATEGORIZED && !isExternalRequest) {
      throw new BadRequestError('User does not work to the company!');
    }
    if (user.role === role) {
      throw new BadRequestError('User has already that role!');
    }

    user.role = role;
    await user.save();

    return `The role of employ ${user.firstName} ${
      user.lastName
    } has been changed to ${user.role.replace('_', ' ')}`;
  }

  async addToCompany(userId: string, role: Roles, company: Types.ObjectId) {
    if (role === Roles.OWNER || role === Roles.UNCATEGORIZED) {
      throw new BadRequestError(
        'You can not make an employ owner or uncategorized!'
      );
    }

    const user = await this.getSingleUser(userId);
    const isWorking = user.role !== Roles.UNCATEGORIZED;

    if (isWorking) {
      throw new BadRequestError('User is already working to the company!');
    }

    await this.update(userId, {
      role: role || Roles.EMPLOY,
      company,
    });

    await Company.updateOne({ _id: company }, { $push: { employees: userId } });

    const message = `The user ${user.firstName} ${
      user.lastName
    } has been added to the company with role: ${
      role.replace('_', ' ') || Roles.EMPLOY
    }`;

    return message;
  }

  async removeFromCompany(userId: string) {
    const user = await this.getOne(userId);
    const { role } = user;

    if (role === Roles.UNCATEGORIZED) {
      throw new BadRequestError('User does not work to the company!');
    }
    if (role === Roles.OWNER) {
      throw new ForbiddenError('You can not remove the owner!');
    }

    await this.deleteUser(userId, true, user);

    return `The employ removed and the account deleted!`;
  }
}
