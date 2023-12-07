import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';

export class AuthController {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }

  public async register(req: Request, res: Response) {
    const newUser = await this.authService.registerUser(req, res);
    res.status(StatusCodes.CREATED).json({ userInfo: newUser });
  }

  public async login(req: Request, res: Response) {
    const loggedInUser = await this.authService.loginUser(req, res);
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
