import { BadRequestError } from '../errors';
import User from '../models/User';
import { IDataImgur, IPasswordPayload, IUser } from '../interfaces/interfaces';
import { ImageService } from './image-service';
import { Roles } from '../interfaces/enums';
import { ForbiddenError } from '../errors/forbidden';
import { createSearchQuery } from '../helpers/create-search-query';
import Company from '../models/Company';

export class UserService {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  public async deleteUser(userId: string, isExternalRequest: boolean = false) {
    const user = (await User.findByIdAndDelete(userId)) as IUser;

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

    return `The user has been deleted.`;
  }

  public async updateUser(
    payload: IUser,
    userId: string,
    file: Express.Multer.File | undefined
  ) {
    const { firstName, lastName, email, phone } = payload;

    const user = (await User.findById(userId)) as IUser;

    let image: IDataImgur | undefined;

    if (file) {
      const { deletehash } = user.image;
      if (deletehash) {
        await this.imageService.deleteSingleImage(deletehash);
      }
      image = await this.imageService.handleSingleImage(file);
    }

    const updatedUser = (await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        image,
        email,
        phone,
      },
      { new: true, runValidators: true }
    ).select('-password -createdAt -updatedAt')) as IUser;

    return updatedUser;
  }

  public async getUsers(page: string, searchString: string) {
    const limit = 10;
    const skip = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<IUser>(searchString as string, [
      'firstName',
      'lastName',
      'role',
    ]);

    return (await User.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .select('-password -createdAt -updatedAt')) as IUser[];
  }

  public async getSingleUser(userId: string) {
    return (await User.findById(userId).select(
      '-password -createdAt -updatedAt'
    )) as IUser;
  }

  public async changePassword(userId: string, payload: IPasswordPayload) {
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

  public async createUser(
    payload: IUser,
    file: Express.Multer.File | undefined
  ) {
    const { firstName, lastName, role, password, email, phone } = payload;

    let image: IDataImgur | undefined;
    if (file) {
      image = await this.imageService.handleSingleImage(file);
    }

    const newUser = await User.create({
      firstName,
      lastName,
      role,
      password,
      email,
      image,
      phone,
    });

    return newUser;
  }

  public async changeUserRole(
    userId: string,
    role: Roles,
    isExternalRequest: boolean = false
  ) {
    if (role === Roles.OWNER) {
      throw new BadRequestError('You can not make an employ owner!');
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

    return `The role of employ ${user.firstName} ${user.lastName} has been changed to ${user.role}`;
  }
}
