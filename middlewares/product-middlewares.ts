import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import Product from '../models/Product';

export const isProductExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError('No product found!');
  }

  next();
};
