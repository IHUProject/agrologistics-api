import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { NotFoundError } from '../errors';

export const checkUnsendItems =
  <T>(model: Model<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const entities = (await model.find({ isSend: false })) as T[];
    if (!entities.length) {
      throw new NotFoundError('No entities found');
    }

    next();
  };
