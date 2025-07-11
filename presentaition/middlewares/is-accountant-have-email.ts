import { Request, Response, NextFunction } from 'express'
import Accountant from '../../data-access/models/Accountant'
import { NotFoundError } from '../../common/errors'

export const hasEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accountant = await Accountant.findOne()
  if (!accountant || !accountant.email) {
    throw new NotFoundError(
      'Accountant does not have email or does not exists!'
    )
  }

  next()
}
