import jwt from 'jsonwebtoken';
import { InternalServerError } from '../errors';
import { Response } from 'express';
import { IUserWithID } from '../interfaces/interfaces';

const { sign, verify } = jwt;

export const createToken = (payload: IUserWithID) => {
  if (process.env.JWT_SECRET) {
    const token: string = sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
  } else {
    throw new InternalServerError('JWT secret is missing');
  }
};

export const isValidToken = (token: string) =>
  verify(token, process.env.JWT_SECRET!);

export const attachTokens = (
  res: Response,
  user: IUserWithID,
  postmanRequest?: boolean
) => {
  const token: string = createToken(user);

  const sixMonths: number = 1000 * 60 * 60 * 24 * 183; //6 months

  if (!postmanRequest) {
    //origin cookie
    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + sixMonths),
      secure: true,
      sameSite: 'none',
      signed: true,
    });
  } else {
    // post man cookie
    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + sixMonths),
      signed: true,
    });
  }

  return token;
};
