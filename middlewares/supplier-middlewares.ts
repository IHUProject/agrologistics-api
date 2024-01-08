import { NextFunction, Response, Request } from 'express';
import { ConflictError, NotFoundError } from '../errors';
import Supplier from '../models/Supplier';

export const hasExpenses = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { costs } = req.body;

  if (costs?.length) {
    throw new ConflictError('You can not add expenses!');
  }

  next();
};

export const isSupplierExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { supplierId } = req.params;

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw new NotFoundError('Supplier does not exists!');
  }

  next();
};
