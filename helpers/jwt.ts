import jwt from 'jsonwebtoken'
import { InternalServerError } from '../errors'
import { Response } from 'express'
import { IUser, IUserWithID } from '../interfaces/interfaces'

const { sign, verify } = jwt

export const createToken = (payload: IUserWithID | IUser) => {
  if (process.env.JWT_SECRET) {
    const token = sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME
    })
    return token
  } else {
    throw new InternalServerError('JWT secret is missing')
  }
}

export const isValidToken = (token: string) =>
  verify(token, process.env.JWT_SECRET!)

export const attachTokens = (res: Response, user: IUserWithID | IUser) => {
  const token = createToken(user)

  const sixMonths = 1000 * 60 * 60 * 24 * 183 //6 months

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + sixMonths),
    secure: true,
    sameSite: 'none',
    signed: true
  })

  return token
}
