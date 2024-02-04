import { ExpenseService } from './../services/expense-service';
import { StatusCodes } from 'http-status-codes';
import { IUserWithID } from '../interfaces/interfaces';
import { Request, Response } from 'express';

export class ExpenseController {
  private expenseService: ExpenseService;
  constructor() {
    this.expenseService = new ExpenseService();
  }

  public async createExpense(req: Request, res: Response) {
    const { body, currentUser, files } = req;

    let fileArray: Express.Multer.File[] | undefined;
    if (Array.isArray(files)) {
      fileArray = files;
    } else if (typeof files === 'object' && files !== null) {
      fileArray = Object.values(files).flat();
    }

    const client = await this.expenseService.createExpense(
      body,
      fileArray,
      currentUser as IUserWithID
    );

    res
      .status(StatusCodes.CREATED)
      .json({ client, message: 'Expense has been created' });
  }

  public async getSingleExpense(req: Request, res: Response) {
    const { expenseId } = req.params;
    const expense = await this.expenseService.getSingleExpense(expenseId);
    res.status(StatusCodes.CREATED).json({ expense });
  }

  public async updateExpense(req: Request, res: Response) {
    const { expenseId } = req.params;
    const { body } = req;
    const client = await this.expenseService.updateExpense(body, expenseId);

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Expense has been updated' });
  }

  public async getExpenses(req: Request, res: Response) {
    const { page, searchString, limit } = req.query;

    const expenses = await this.expenseService.getExpenses(
      page as string,
      searchString as string,
      limit as string
    );

    res.status(StatusCodes.OK).json({ expenses, totalCount: expenses.length });
  }

  public async deleteCategory(req: Request, res: Response) {
    const { expensesId } = req.params;
    const expense = await this.expenseService.deleteExpense(expensesId);

    res
      .status(StatusCodes.OK)
      .json({ expense, message: 'Expense has been deleted' });
  }
}
