import { NextFunction, Response, Request } from 'express';
import { NotFoundError } from '../errors';
import Supplier from '../models/Supplier';

export const isSupplierExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const supplierId = req.params.supplierId || req.body.supplier;

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw new NotFoundError('Supplier does not exists!');
  }

  next();
};
