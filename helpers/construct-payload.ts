import { Request } from 'express';
import { IPayload } from '../interfaces/interfaces';

export const constructPayload = <T>(req: Request, data: T): IPayload<T> => ({
  postmanRequest: !!req.headers['x-postman-request'],
  data: data,
});
