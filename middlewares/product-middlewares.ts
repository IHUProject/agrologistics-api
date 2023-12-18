import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors';
import Product from '../models/Product';
import { IPurchase } from '../interfaces/interfaces';

export const isProductExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const { products } = req.body as IPurchase;

  if (productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('No product found!');
    }
  }

  if (products?.length) {
    await Promise.all(
      products.map(async (id) => {
        const product = await Product.findById(id);
        if (!product) {
          throw new NotFoundError('No product found!');
        }
      })
    );
  }

  next();
};
