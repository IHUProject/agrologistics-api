import { Request, Response } from 'express';
import { UnauthorizedError } from '../errors';
import User from '../models/User';
import { attachTokens } from '../helpers';
import { createTokenUser } from '../helpers/create-token-user';
import { UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { IUser } from '../interfaces/interfaces';

export class AuthService {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  public async registerUser(req: Request, res: Response) {
    const { firstName, lastName, email, password } = req.body;
    const { files } = req;

    let user = (await User.create({
      firstName,
      lastName,
      email,
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
    attachTokens(res, tokenUser, req.body.postmanRequest);

    return tokenUser;
  }
  public async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const tokenUser = createTokenUser(user);
    attachTokens(res, tokenUser, req.body.postmanRequest);

    return tokenUser;
  }
}
