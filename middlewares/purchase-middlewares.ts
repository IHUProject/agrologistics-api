import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import Purchase from '../models/Purchase';

export const isPurchaseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { purchaseId } = req.params;
  const purchase = await Purchase.findById(purchaseId);

  if (!purchase) {
    throw new NotFoundError('Purchase does not exists!');
  }

  next();
};
