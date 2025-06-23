import { ForbiddenError } from '../../common/errors/forbidden'
import { IUserWithID } from '../../types/interfaces'
import { Request, Response, NextFunction } from 'express'
import { BadRequestError } from '../../common/errors'
import { Roles } from '../../types/enums'
import { isValidToken } from '../../common/helpers/jwt'
import User from '../../data-access/models/User'

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string =
    req.signedCookies.token ||
    req.headers.authorization?.split(' ')[1] ||
    ''

  if (!token) {
    throw new ForbiddenError('Access denied, no user available!')
  }

  try {
    const payload = isValidToken(token) as IUserWithID
    const user = await User.findById(payload.userId)

    if (!user) {
      throw new BadRequestError('User token/id problem...')
    }

    // Attach the user to the req object
    req.currentUser = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      company: user.company
    } as IUserWithID

    next()
  } catch (error) {
    throw new ForbiddenError('Access denied')
  }
}

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string =
    req.signedCookies.token ||
    req.headers.authorization?.split(' ')[1] ||
    ''

  if (token) {
    throw new BadRequestError('You are all ready logged in')
  }

  next()
}

export const isNotLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string =
    req.signedCookies.token ||
    req.headers.authorization?.split(' ')[1] ||
    ''

  if (!token) {
    throw new BadRequestError('There is no user to logout')
  }

  next()
}

export const authorizePermissions =
  (...roles: Roles[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.currentUser?.role as Roles)) {
      throw new ForbiddenError('Unauthorized to access this route')
    }
    next()
  }
