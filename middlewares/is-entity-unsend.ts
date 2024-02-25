import { Request, Response, NextFunction } from 'express';
import { ConflictError } from '../errors';
import { Model } from 'mongoose';
import { IExpense, IPurchase } from '../interfaces/interfaces';

export const isSend =
  <T>(model: Model<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const entity = (await model.findById(id)) as IExpense | IPurchase;
    if (entity.isSend) {
      throw new ConflictError('Entity has been already send!');
    }

    next();
  };
