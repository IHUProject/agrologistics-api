import { BadRequestError } from '../errors';
import User from '../models/User';
import { IDataImgur, IPasswordPayload, IUser } from '../interfaces/interfaces';
import { ImageService } from './general-services/image-service';
import { Roles } from '../interfaces/enums';
import { ForbiddenError } from '../errors/forbidden';
import Company from '../models/Company';
import { createTokenUser } from '../helpers/create-token-user';
import { DataLayerService } from './general-services/data-layer-service';

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

  public async deleteUser(userId: string, isExternalRequest: boolean = false) {
    const user = (await this.getOne(userId)) as IUser;

    const { role } = user;
    if (role === Roles.OWNER && !isExternalRequest) {
      throw new ForbiddenError(
        'Please delete your company to proceed to this action!'
      );
    }

    await Company.updateOne({}, { $pull: { employees: userId } });

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
    console.log(payload);

    await this.validateData(payload);

    let user = (await this.getOne(userId)) as IUser;

    let image: IDataImgur | undefined;
    if (file) {
      const { deletehash } = user.image;
      if (deletehash) {
        await this.imageService.deleteSingleImage(deletehash);
      }
      image = await this.imageService.handleSingleImage(file);
    }

    user = (await this.update(
      userId,
      { ...payload, image },
      this.select
    )) as IUser;

    const tokenUser = createTokenUser(user);

    return tokenUser;
  }

  public async getUsers(page: string, searchString: string) {
    return (await this.getMany(
      page,
      this.select,
      searchString,
      this.searchFields
    )) as IUser[];
  }

  public async getSingleUser(userId: string) {
    return (await this.getOne(userId, this.select)) as IUser;
  }

  public async changePassword(userId: string, payload: IPasswordPayload) {
    const { oldPassword, newPassword } = payload;

    const user = (await User.findById(userId)) as IUser;

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
    const { role } = payload;

    if (role === Roles.OWNER) {
      throw new BadRequestError('You can not make the new user owner!');
    }

    await this.validateData(payload);

    let image: IDataImgur | undefined;
    if (file) {
      image = await this.imageService.handleSingleImage(file);
    }

    const user = await super.create({
      ...payload,
      image,
    });

    await Company.updateOne({}, { $push: { employees: user._id } });

    return await this.getOne(user._id, this.select);
  }

  public async changeUserRole(
    userId: string,
    role: Roles,
    isExternalRequest: boolean = false
  ) {
    if (role === Roles.OWNER || role === Roles.UNCATEGORIZED) {
      throw new BadRequestError(
        'You can not make an employ owner or uncategorized!'
      );
    }

    const user = (await User.findById(userId)) as IUser;
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
}
