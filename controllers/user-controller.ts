import { Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { IUserWithID } from '../interfaces/interfaces';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getCurrentUser(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ userInfo: req.currentUser });
  }

  public async updateUser(req: Request, res: Response) {
    const { body } = req;
    const { userId } = req.params;
    const { files } = req;
    const updatedUser = await this.userService.updateUser(
      body,
      userId,
      files,
      res
    );
    res.status(StatusCodes.OK).json({ userInfo: updatedUser });
  }

  public async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const { role } = req.currentUser as IUserWithID;
    const result = await this.userService.deleteUser(userId, role, res);
    res.status(StatusCodes.OK).json({ result });
  }

  public async getUsers(req: Request, res: Response) {
    const { page, searchString } = req.query;
    const users = await this.userService.getUsers(
      page as string,
      searchString as string
    );
    res.status(StatusCodes.OK).json({ users, totalCount: users.length });
  }

  public async getSingleUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this.userService.getSingleUser(userId);
    res.status(StatusCodes.OK).json({ userInfo: user });
  }

  public async changePassword(req: Request, res: Response) {
    const { userId } = req.params;
    const { body } = req;
    const result = await this.userService.changePassword(userId, body);
    res.status(StatusCodes.OK).json({ result });
  }

  public async changeUserRole(req: Request, res: Response) {
    const { userId } = req.params;
    const { body } = req;
    const { currentUser } = req;
    const result = await this.userService.changeUserRole(
      userId,
      body,
      currentUser as IUserWithID
    );
    res.status(StatusCodes.OK).json({ result });
  }

  public async addToCompany(req: Request, res: Response) {
    const { userId } = req.params;
    const { companyId, role } = req.body;
    const result = await this.userService.addToCompany(userId, role, companyId);
    res.status(StatusCodes.OK).json({ result });
  }

  public async removeFromCompany(req: Request, res: Response) {
    const { userId } = req.params;
    const { currentUser } = req;
    const result = await this.userService.removeFromCompany(
      userId,
      currentUser as IUserWithID
    );
    res.status(StatusCodes.OK).json({ result });
  }
}
