import { StatusCodes } from 'http-status-codes';
import { AccountantService } from '../services/accountant-service';
import { Request, Response } from 'express';

export class AccountantController {
  private accountantService: AccountantService;
  constructor() {
    this.accountantService = new AccountantService();
  }

  public async createAccountant(req: Request, res: Response) {
    const newAccountant = await this.accountantService.createAccountant(req);
    res.status(StatusCodes.CREATED).json({ accountantInfo: newAccountant });
  }

  public async getSingleAccountant(req: Request, res: Response) {
    const accountant = await this.accountantService.getSingleAccountant(req);
    res.status(StatusCodes.OK).json({ accountantInfo: accountant });
  }

  public async updateAccountant(req: Request, res: Response) {
    const updateAccountant = await this.accountantService.updateAccountant(req);
    res.status(StatusCodes.OK).json({ accountantInfo: updateAccountant });
  }

  public async deleteAccountant(req: Request, res: Response) {
    const result = await this.accountantService.deleteAccountant(req);
    res.status(StatusCodes.OK).json({ result });
  }
}
