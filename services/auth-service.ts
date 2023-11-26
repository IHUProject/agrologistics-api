import { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../errors';
import User from '../models/User';
import { IUser, IUserWithID } from '../interfaces/interfaces';
import { attachTokens } from '../helpers';
import { createTokenUser } from '../helpers/createTokenUser';
import validator from 'validator';

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
    const { firstName, lastName, email, password, image } = this.req.body;
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

    const finalImage: string = !image ? this.defaultImageProfile : image;

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
}
