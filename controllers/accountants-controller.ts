import { StatusCodes } from 'http-status-codes';
import { AccountantService } from '../services/accountant-service';
import { Request, Response } from 'express';
import { IUserWithID } from '../interfaces/interfaces';

export class AccountantController {
  private accountantService: AccountantService;
  constructor() {
    this.accountantService = new AccountantService();
  }

  public async createAccountant(req: Request, res: Response) {
    const { body, currentUser } = req;
    const { company } = currentUser as IUserWithID;
    const newAccountant = await this.accountantService.createAccountant(
      body,
      company
    );
    res.status(StatusCodes.CREATED).json({ accountantInfo: newAccountant });
  }

  public async getSingleAccountant(req: Request, res: Response) {
    const { company } = req.currentUser as IUserWithID;
    const accountant = await this.accountantService.getSingleAccountant(
      company
    );
    res.status(StatusCodes.OK).json(accountant);
  }

  public async updateAccountant(req: Request, res: Response) {
    const { body, currentUser } = req;
    const { company } = currentUser as IUserWithID;
    const { accId } = req.params;
    const updateAccountant = await this.accountantService.updateAccountant(
      body,
      accId,
      company
    );
    res.status(StatusCodes.OK).json({ accountantInfo: updateAccountant });
  }

  public async deleteAccountant(req: Request, res: Response) {
    const { accId } = req.params;
    const result = await this.accountantService.deleteAccountant(accId);
    res.status(StatusCodes.OK).json({ result });
  }
}
