import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';
import Category from '../models/Category';

export const isCategoryExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const categoryId = req.params.categoryId || req.body.category;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new NotFoundError('No category found!');
  }

  next();
};
