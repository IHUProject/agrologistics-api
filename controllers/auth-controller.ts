import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';
import { IUser } from '../interfaces/interfaces';
import { constructPayload } from '../helpers/construct-payload';

export class AuthController {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }

  public async register(req: Request, res: Response) {
    const { files, body } = req;

    const payload = constructPayload<IUser>(req, body);
    const newUser = await this.authService.registerUser(payload, files, res);

    res.status(StatusCodes.CREATED).json({ userInfo: newUser });
  }

  public async login(req: Request, res: Response) {
    const { body } = req;

    const payload = constructPayload<IUser>(req, body);
    const loggedInUser = await this.authService.loginUser(payload, res);

    res.status(StatusCodes.OK).json({ userInfo: loggedInUser });
  }

  logout(req: Request, res: Response) {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
      secure: true,
      sameSite: 'none',
      signed: true,
    });
    res.status(StatusCodes.OK).json({ result: 'User logged out!' });
  }
}
