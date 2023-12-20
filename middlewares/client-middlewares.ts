import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';
import Client from '../models/Client';

export const isClientExists =
  (isUpdatingPurchase: boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.params.clientId || req.body.client;

    if (!clientId) {
      if (isUpdatingPurchase) {
        return next();
      } else {
        throw new NotFoundError('Client ID is required.');
      }
    }

    const client = await Client.findById(clientId);
    if (!client) {
      throw new NotFoundError('No client found!');
    }

    next();
  };
