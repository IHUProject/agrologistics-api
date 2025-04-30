import { NextFunction, Request, Response } from 'express'
import { Model } from 'mongoose'
import { NotFoundError } from '../errors'

export const isEntityExists =
  <T>(model: Model<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    const entity = await model.findById(id)
    if (!entity) {
      throw new NotFoundError('Entity does not exist!')
    }

    next()
  }

export const isEntityExistsIdOnPayload =
  <T>(model: Model<T>, idOnPayload: string, isUpdating = false) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const entityId = req.body[idOnPayload]

    if (!entityId) {
      if (!isUpdating) {
        return next()
      } else {
        throw new NotFoundError(`Entity ${idOnPayload} is missing!`)
      }
    }

    const entity = await model.findById(entityId)
    if (!entity) {
      throw new NotFoundError(`Entity ${idOnPayload} does not exist!`)
    }

    next()
  }
