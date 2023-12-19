import { Response } from 'express';
import { UnauthorizedError } from '../errors';
import User from '../models/User';
import { attachTokens } from '../helpers';
import { createTokenUser } from '../helpers/create-token-user';
import { IUser } from '../interfaces/interfaces';
import { ImageService } from './general-services/image-service';
import { DataLayerService } from './general-services/data-layer-service';

export class AuthService extends DataLayerService<IUser> {
  private imageService: ImageService;

  constructor() {
    super(User);
    this.imageService = new ImageService();
  }

  public async registerUser(
    payload: IUser,
    file: Express.Multer.File | undefined
  ) {
    this.validateData(payload);

    const image = await this.imageService.handleSingleImage(file);
    const user = await super.create({ ...payload, image });

    return createTokenUser(user);
  }

  public async loginUser(payload: IUser, res: Response) {
    const { email, password } = payload;

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const tokenUser = createTokenUser(user);
    attachTokens(res, tokenUser);

    return tokenUser;
  }
}
