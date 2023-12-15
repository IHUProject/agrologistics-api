import { StatusCodes } from 'http-status-codes';
import { AccountantService } from '../services/accountant-service';
import { Request, Response } from 'express';

export class AccountantController {
  private accountantService: AccountantService;
  constructor() {
    this.accountantService = new AccountantService();
  }

  public async createAccountant(req: Request, res: Response) {
    const { body } = req;

    const newAccountant = await this.accountantService.createAccountant(body);

    res.status(StatusCodes.CREATED).json({
      accountantInfo: newAccountant,
      msg: 'Accountant had been successfully created',
    });
  }

  public async getSingleAccountant(req: Request, res: Response) {
    const accountant = await this.accountantService.getSingleAccountant();
    res.status(StatusCodes.OK).json(accountant);
  }

  public async updateAccountant(req: Request, res: Response) {
    const { body } = req;
    const { accId } = req.params;

    const updateAccountant = await this.accountantService.updateAccountant(
      body,
      accId
    );

    res.status(StatusCodes.OK).json({
      accountantInfo: updateAccountant,
      msg: 'Accountant had been successfully update',
    });
  }

  public async deleteAccountant(req: Request, res: Response) {
    const { accId } = req.params;
    const result = await this.accountantService.deleteAccountant(accId);
    res.status(StatusCodes.OK).json({ result });
  }
}
