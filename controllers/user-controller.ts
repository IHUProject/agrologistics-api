import { Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { reattachTokens } from '../helpers/re-attack-tokens';
import { IUserWithID } from '../interfaces/interfaces';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getCurrentUser(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ user: req.currentUser });
  }

  public async updateUser(req: Request, res: Response) {
    const { body } = req;
    const { userId } = req.params;
    const { file } = req;
    const { currentUser } = req;

    const user = await this.userService.updateUser(body, userId, file);
    await reattachTokens(res, (currentUser as IUserWithID).userId.toString());

    res.status(StatusCodes.OK).json({
      user,
      message: 'User had been successfully updated!',
    });
  }

  public async createUser(req: Request, res: Response) {
    const { body, file } = req;
    const user = await this.userService.createUser(body, file);

    res
      .status(StatusCodes.OK)
      .json({ user, message: 'User had been successfully created!' });
  }

  public async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this.userService.deleteUser(userId);

    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
      secure: true,
      sameSite: 'none',
      signed: true,
    });

    res
      .status(StatusCodes.OK)
      .json({ user, message: 'User has been deleted!' });
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
    res.status(StatusCodes.OK).json({ user });
  }

  public async changePassword(req: Request, res: Response) {
    const { userId } = req.params;
    const { body } = req;
    const message = await this.userService.changePassword(userId, body);
    res.status(StatusCodes.OK).json({ message });
  }

  public async changeUserRole(req: Request, res: Response) {
    const { userId } = req.params;
    const { body } = req;
    const { role } = body;
    const message = await this.userService.changeUserRole(userId, role);
    res.status(StatusCodes.OK).json({ message });
  }
}
