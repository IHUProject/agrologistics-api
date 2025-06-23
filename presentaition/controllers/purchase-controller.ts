import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { PurchaseService } from '../../business/purchase-service'
import Purchase from '../../data-access/models/Purchase'

export class PurchaseController {
  private purchaseService: PurchaseService

  constructor() {
    this.purchaseService = new PurchaseService()
  }

  public async createPurchase(req: Request, res: Response) {
    const { body, currentUser } = req

    const purchase = await this.purchaseService.createPurchase(
      body,
      currentUser
    )

    res.status(StatusCodes.CREATED).json({
      purchase,
      message: 'Purchase has been successfully created'
    })
  }

  public async getSinglePurchase(req: Request, res: Response) {
    const { id } = req.params
    const purchase = await this.purchaseService.getSinglePurchase(id)
    res.status(StatusCodes.OK).json({ purchase })
  }

  public async updatePurchase(req: Request, res: Response) {
    const { body } = req
    const { id } = req.params
    const purchase = await this.purchaseService.updatePurchase(body, id)

    res
      .status(StatusCodes.OK)
      .json({ purchase, message: 'Purchase has been updated!' })
  }

  public async deletePurchase(req: Request, res: Response) {
    const { id } = req.params
    const purchase = await this.purchaseService.deletePurchase(id)

    res
      .status(StatusCodes.OK)
      .json({ purchase, message: 'Purchase has been deleted' })
  }

  public async getPurchases(req: Request, res: Response) {
    const { page, searchString, limit } = req.query

    const purchase = await this.purchaseService.getPurchases(
      page as string,
      searchString as string,
      limit as string
    )

    const total = await Purchase.countDocuments()

    res
      .status(StatusCodes.OK)
      .json({ purchase, totalCount: purchase.length, total })
  }
}
