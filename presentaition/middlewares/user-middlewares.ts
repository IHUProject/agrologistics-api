import { NextFunction, Request, Response } from 'express'
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError
} from '../../common/errors'
import { IUser, IUserWithID } from '../../types/interfaces'
import { ForbiddenError } from '../../common/errors/forbidden'
import { Roles } from '../../types/enums'

export const verifyAccountOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  if (id !== req.currentUser?.userId.toString()) {
    throw new UnauthorizedError('You can perform this action!')
  }

  next()
}

export const preventSelfModification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { currentUser } = req

  if (id === (currentUser as IUserWithID).userId.toString()) {
    throw new ForbiddenError(
      'You can perform that action to your account!'
    )
  }

  next()
}

export const hasRoleProperty = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body as IUser

  if (role) {
    throw new ConflictError('You can not change or add the role!')
  }

  next()
}

export const hasForbiddenRoleType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body

  if (role === Roles.OWNER || role === Roles.UNCATEGORIZED) {
    throw new BadRequestError(`Forbidden role type ${role}`)
  }

  next()
}
