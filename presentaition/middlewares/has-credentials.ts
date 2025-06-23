import { Request, Response, NextFunction } from 'express'
import Credential from '../../data-access/models/Credential'
import { NotFoundError } from '../../common/errors'

export const hasCreds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const creds = await Credential.findOne()
  if (!creds || !creds.pass || !creds.email) {
    throw new NotFoundError(
      'Credentials do not exist or do not have required fields'
    )
  }

  next()
}
