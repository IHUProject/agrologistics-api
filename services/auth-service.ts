import { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../errors';
import User from '../models/User';
import { attachTokens } from '../helpers';
import { createTokenUser } from '../helpers/create-token-user';
import { UploadedFile } from 'express-fileupload';
import { ImageService } from './image-service';
import { DefaultImage } from '../interfaces/enums';

export class AuthService {
  private req: Request;
  private res: Response;
  private imageService: ImageService;

  constructor(req: Request, res: Response) {
    this.req = req;
    this.res = res;
    this.imageService = new ImageService(req);
  }

  async registerUser() {
    const { firstName, lastName, email, password } = this.req.body;
    const { files } = this.req;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email is already in use');
    }

    const image = await this.imageService.handleSingleImage(
      files?.image as UploadedFile[],
      DefaultImage.PROFILE_IMAGE
    );

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      image,
    });

    const tokenUser = createTokenUser(user);
    attachTokens(this.res, tokenUser, this.req.body.postmanRequest);

    return tokenUser;
  }
  async loginUser() {
    const { email, password } = this.req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const tokenUser = createTokenUser(user);

    attachTokens(this.res, tokenUser, this.req.body.postmanRequest);
    return tokenUser;
  }
}
