import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

export class SupplierController {
  constructor() {}

  public async createSupplier(req: Request, res: Response) {
    res.status(StatusCodes.CREATED).json({ msg: 'Create Supplier' });
  }

  public async getSingleSupplier(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ msg: 'get single supplier' });
  }

  public async updateSupplier(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ msg: 'update supplier' });
  }

  public async deleteSupplier(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ msg: 'delete supplier' });
  }

  public async getSuppliers(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ msg: 'get supplier' });
  }
}
