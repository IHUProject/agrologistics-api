import { NextFunction, Request, Response } from 'express'
import { BadRequestError, ConflictError, NotFoundError } from '../errors'
import { ICategory, ICompany, IExpense, IPurchase, ISupplier } from '../interfaces/interfaces'
import Product from '../models/Product'

export const validateCoordinates = (req: Request, res: Response, next: NextFunction) => {
  const { latitude, longitude } = req.body

  if (latitude && !longitude) {
    throw new BadRequestError('Add longitude!')
  }

  if (!latitude && longitude) {
    throw new BadRequestError('Add latitude!')
  }

  next()
}

export const validateQueryPageAndQueryLimit = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.query

  if (page && isNaN(Number(page))) {
    throw new BadRequestError('Page number must be a valid number')
  }

  const pageNumber = Number(page) || 1

  if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
    throw new BadRequestError('Page number must be a positive safe integer')
  }

  if (limit && isNaN(Number(limit))) {
    throw new BadRequestError('Limit number must be a valid number')
  }

  const limitNumber = Number(limit) || 1

  if (!Number.isSafeInteger(limitNumber) || limitNumber < 1) {
    throw new BadRequestError('Limit number must be a positive safe integer')
  }

  next()
}

export const hasPurchasesProperty = (req: Request, res: Response, next: NextFunction) => {
  const { purchases } = req.body

  if (purchases?.length) {
    throw new ConflictError('You can not add purchases!')
  }

  next()
}

export const hasCompanyOrUserId = (req: Request, res: Response, next: NextFunction) => {
  const { createdBy, company } = req.body

  if (createdBy || company) {
    throw new ConflictError('You can not add company or user to the entity!')
  }

  next()
}

export const hasSendProperty = (req: Request, res: Response, next: NextFunction) => {
  const { isSend } = req.body as IPurchase | IExpense

  if (isSend) {
    throw new ConflictError('Send property does not allow!')
  }

  next()
}

export const hasExpenses = (req: Request, res: Response, next: NextFunction) => {
  const { expenses } = req.body as ICategory | ISupplier

  if (expenses?.length) {
    throw new ConflictError('You can not add expenses!')
  }

  next()
}

export const hasExistingCompanyRelations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body as ICompany

  const relations = [
    payload.suppliers,
    payload.employees,
    payload.purchases,
    payload.clients,
    payload.products,
    payload.expenses,
    payload.categories
  ]

  const hasRelations =
    relations.some(relation => relation?.length) ||
    payload.accountant ||
    payload.owner ||
    payload.credentials

  if (hasRelations) {
    throw new ConflictError('Operation forbidden: Existing company references detected.')
  }

  next()
}

export const areProductsExists = async (req: Request, res: Response, next: NextFunction) => {
  const { products } = req.body as IPurchase

  if (products?.length) {
    await Promise.all(
      products.map(async id => {
        const product = await Product.findById(id)
        if (!product) {
          throw new NotFoundError(`No product found with ID: ${id}!`)
        }
      })
    )
  }

  next()
}
