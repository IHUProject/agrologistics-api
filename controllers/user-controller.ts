import { Request, Response } from 'express';
import { UserService } from '../services/user-service';
import { StatusCodes } from 'http-status-codes';
import { reattachTokens } from '../helpers/re-attack-tokens';
import { IUserWithID } from '../interfaces/interfaces';
import User from '../models/User';

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
    const { id } = req.params;
    const { file } = req;
    const { currentUser } = req;

    const user = await this.userService.updateUser(body, id, file);
    await reattachTokens(res, (currentUser as IUserWithID).userId.toString());

    res.status(StatusCodes.OK).json({
      user,
      message: 'User had been successfully updated!',
    });
  }

  public async createUser(req: Request, res: Response) {
    const { body, file, currentUser } = req;

    const user = await this.userService.createUser(
      { ...body, company: currentUser?.company },
      file
    );

    res
      .status(StatusCodes.OK)
      .json({ user, message: 'User had been successfully created!' });
  }

  public async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await this.userService.deleteUser(id);

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
    const { page, searchString, limit } = req.query;

    const users = await this.userService.getUsers(
      page as string,
      searchString as string,
      limit as string
    );

    const total = await User.countDocuments();

    res.status(StatusCodes.OK).json({ users, totalCount: users.length, total });
  }

  public async getSingleUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await this.userService.getSingleUser(id);
    res.status(StatusCodes.OK).json({ user });
  }

  public async changePassword(req: Request, res: Response) {
    const { id } = req.params;
    const { body } = req;
    const message = await this.userService.changePassword(id, body);
    res.status(StatusCodes.OK).json({ message });
  }

  public async changeUserRole(req: Request, res: Response) {
    const { id } = req.params;
    const { body } = req;
    const { role } = body;
    const message = await this.userService.changeUserRole(id, role);
    res.status(StatusCodes.OK).json({ message });
  }

  public async addToCompany(req: Request, res: Response) {
    const { id } = req.params;
    const { role } = req.body;
    const { currentUser } = req;

    const message = await this.userService.addToCompany(
      id,
      role,
      (currentUser as IUserWithID).company
    );

    res.status(StatusCodes.OK).json({ message });
  }

  public async removeFromCompany(req: Request, res: Response) {
    const { id } = req.params;
    const message = await this.userService.removeFromCompany(id);
    res.status(StatusCodes.OK).json({ message });
  }

  public async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const message = await this.userService.forgotPassword(email);
    res.status(StatusCodes.OK).json({ message });
  }
}
