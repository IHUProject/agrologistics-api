import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';
import Expense from '../models/Expense';

export const isExpenseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { expenseId } = req.params;

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new NotFoundError('No expense found!');
  }

  next();
};
