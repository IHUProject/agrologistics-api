import { Response } from 'express';
import { UnauthorizedError } from '../errors';
import User from '../models/User';
import { attachTokens } from '../helpers';
import { createTokenUser } from '../helpers/create-token-user';
import { IDataImgur, IPayload, IUser } from '../interfaces/interfaces';
import { ImageService } from './image-service';

export class AuthService {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  public async registerUser(
    payload: IUser,
    file: Express.Multer.File | undefined
  ) {
    const { firstName, lastName, email, password, phone } = payload;

    let image: IDataImgur | undefined;

    if (file) {
      image = await this.imageService.handleSingleImage(file);
    }

    const user = (await User.create({
      firstName,
      lastName,
      email,
      phone,
      image,
      password,
    })) as IUser;

    const tokenUser = createTokenUser(user);

    return tokenUser;
  }
  public async loginUser(payload: IPayload<IUser>, res: Response) {
    const { postmanRequest } = payload;
    const { email, password } = payload.data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const tokenUser = createTokenUser(user);
    attachTokens(res, tokenUser, postmanRequest);

    return tokenUser;
  }
}
