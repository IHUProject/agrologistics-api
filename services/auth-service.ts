import { Request, Response } from 'express';
import { BadRequestError, ConflictError, UnauthorizedError } from '../errors';
import User from '../models/User';
import { IUser, IUserWithID } from '../interfaces/interfaces';
import { attachTokens } from '../helpers';
import { createTokenUser } from '../helpers/create-token-user';
import validator from 'validator';
import fs from 'fs';
import { cloudinaryUpload } from '../helpers/cloudinary-image-handler';
import { UploadedFile } from 'express-fileupload';

export class AuthService {
  private req: Request;
  private res: Response;
  private defaultImageProfile: string;
  private isFromPostMan: boolean;

  constructor(req: Request, res: Response) {
    this.req = req;
    this.res = res;
    this.defaultImageProfile =
      'https://images.squarespace-cdn.com/content/v1/51239e9ae4b0dce195cba126/1556466683303-K5V354MR8E4W0YOOT21G/Question-mark-face.jpg?format=2500w';
    this.isFromPostMan = req.body.isFromPostMan;
  }

  async registerUser() {
    const { firstName, lastName, email, password } = this.req.body;

    const isMissingRequiredData: boolean =
      !firstName || !lastName || !email || !password;

    if (isMissingRequiredData) {
      throw new BadRequestError(
        'Password, e-mail, first-name and last-name required.'
      );
    }

    const isValidEmail: boolean = validator.isEmail(email);
    if (!isValidEmail) {
      throw new BadRequestError('Please provide a valid email');
    }

    const image: string | undefined = await this.profileImageHandler(
      this.req.files?.image as UploadedFile[]
    );
    const finalImage: string = image ? image : this.defaultImageProfile;

    const emailExists: boolean | null = await User.findOne({ email });
    if (emailExists) {
      throw new BadRequestError('The e-mail is already in use.');
    }

    const user: IUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      image: finalImage,
    });

    const tokenUser: IUserWithID = createTokenUser(user);
    attachTokens(this.res, tokenUser, this.isFromPostMan);

    return tokenUser;
  }
  async loginUser() {
    const { email, password } = this.req.body;

    if (!email) {
      throw new BadRequestError('Please provide e-mail.');
    }
    if (!password) {
      throw new BadRequestError('Please provide password.');
    }

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const isPasswordCorrect: boolean = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('The e-mail or password are not correct!');
    }

    const tokenUser: IUserWithID = createTokenUser(user);

    attachTokens(this.res, tokenUser, this.isFromPostMan);
    return tokenUser;
  }

  async profileImageHandler(image: UploadedFile[]) {
    if (!Array.isArray(image)) {
      image = [image];
    }

    if (image.length > 1) {
      throw new BadRequestError(
        'You allowed to upload only 1 image for profile image'
      );
    }

    if (this.req.files && !image) {
      fs.rmSync('tmp', { recursive: true });
      throw new BadRequestError('Something went wrong, try again!');
    } else if (this.req.files && image) {
      if (
        image[0].mimetype !== 'image/png' &&
        image[0].mimetype !== 'image/jpeg' &&
        image[0].mimetype !== 'image/jpg'
      ) {
        fs.rmSync('tmp', { recursive: true });
        throw new ConflictError('This file type is not valid!');
      }
      return (await cloudinaryUpload(image)).join('');
    }
  }
}
