import { Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getCurrentUser(req: Request, res: Response) {
    const currentUser = this.userService.getCurrentUser(req);
    res.status(StatusCodes.OK).json({ userInfo: currentUser });
  }

  public async updateUser(req: Request, res: Response) {
    const updatedUser = await this.userService.updateUser(req, res);
    res.status(StatusCodes.OK).json({ userInfo: updatedUser });
  }

  public async deleteUser(req: Request, res: Response) {
    const result = await this.userService.deleteUser(req, res);
    res.status(StatusCodes.OK).json({ result });
  }

  public async getUsers(req: Request, res: Response) {
    const users = await this.userService.getUsers(req);
    res.status(StatusCodes.OK).json({ users, totalCount: users.length });
  }

  public async getSingleUser(req: Request, res: Response) {
    const user = await this.userService.getSingleUser(req);
    res.status(StatusCodes.OK).json({ userInfo: user });
  }

  public async changePassword(req: Request, res: Response) {
    const result = await this.userService.changePassword(req);
    res.status(StatusCodes.OK).json({ result });
  }

  public async changeUserRole(req: Request, res: Response) {
    const result = await this.userService.changeUserRole(req);
    res.status(StatusCodes.OK).json({ result });
  }

  public async addToCompany(req: Request, res: Response) {
    const result = await this.userService.addToCompany(req);
    res.status(StatusCodes.OK).json({ result });
  }

  public async removeFromCompany(req: Request, res: Response) {
    const result = await this.userService.removeFromCompany(req);
    res.status(StatusCodes.OK).json({ result });
  }
}
