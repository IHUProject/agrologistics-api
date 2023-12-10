import { Response } from 'express';
import { UnauthorizedError } from '../errors';
import User from '../models/User';
import { attachTokens } from '../helpers';
import { createTokenUser } from '../helpers/create-token-user';
import { FileArray, UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { IPayload, IUser } from '../interfaces/interfaces';

export class AuthService {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  public async registerUser(
    payload: IPayload<IUser>,
    files: FileArray | null | undefined,
    res: Response
  ) {
    const { firstName, lastName, email, password, phone } = payload.data;
    const { postmanRequest } = payload;

    let user = (await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
    })) as IUser;

    if (files?.image) {
      const image = await this.imageService.handleSingleImage(
        files?.image as UploadedFile[]
      );

      user = (await User.findByIdAndUpdate(
        user._id,
        { image },
        { new: true }
      )) as IUser;
    }

    const tokenUser = createTokenUser(user);
    attachTokens(res, tokenUser, postmanRequest);

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
