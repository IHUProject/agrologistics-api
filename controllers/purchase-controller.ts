import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { PurchaseService } from '../services/purchase-service';

export class PurchaseController {
  private purchaseService: PurchaseService;

  constructor() {
    this.purchaseService = new PurchaseService();
  }

  public async createPurchase(req: Request, res: Response) {
    const { body } = req;
    const purchase = await this.purchaseService.createPurchase(body);

    res
      .status(StatusCodes.CREATED)
      .json({ purchase, message: 'Purchase has been successfully created' });
  }

  public async getSinglePurchase(req: Request, res: Response) {
    const { purchaseId } = req.params;
    const purchase = await this.purchaseService.getSinglePurchase(purchaseId);

    res.status(StatusCodes.OK).json({ purchase });
  }

  public async updatePurchase(req: Request, res: Response) {
    const { body } = req;
    const { purchaseId } = req.params;
    const purchase = await this.purchaseService.updatePurchase(
      body,
      purchaseId
    );

    res
      .status(StatusCodes.OK)
      .json({ purchase, message: 'Purchase has been updated!' });
  }

  public async deletePurchase(req: Request, res: Response) {
    const { purchaseId } = req.params;
    const purchase = await this.purchaseService.deletePurchase(purchaseId);

    res
      .status(StatusCodes.OK)
      .json({ purchase, message: 'Purchase has been deleted' });
  }

  public async getPurchases(req: Request, res: Response) {
    const { page, searchString } = req.query;

    const purchase = await this.purchaseService.getPurchases(
      page as string,
      searchString as string
    );

    res.status(StatusCodes.OK).json({ purchase, totalCount: purchase.length });
  }
}
