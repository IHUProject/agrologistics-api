import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

export const notFoundMiddleware = (req: Request, res: Response) =>
  res.status(StatusCodes.NOT_FOUND).send("The path doesn't exists!");
