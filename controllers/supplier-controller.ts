import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { IUserWithID } from '../interfaces/interfaces';
import { SupplierService } from '../services/supplier-service';
import Supplier from '../models/Supplier';

export class SupplierController {
  supplierService: SupplierService;
  constructor() {
    this.supplierService = new SupplierService();
  }

  public async createSupplier(req: Request, res: Response) {
    const { body, currentUser } = req;
    const { company, userId } = currentUser as IUserWithID;

    const supplier = await this.supplierService.createSupplier({
      ...body,
      company,
      createdBy: userId,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ supplier, message: 'Supplier has been created!' });
  }

  public async getSingleSupplier(req: Request, res: Response) {
    const { supplierId } = req.params;
    const supplier = await this.supplierService.getSingleSupplier(supplierId);
    res.status(StatusCodes.OK).json({ supplier });
  }

  public async updateSupplier(req: Request, res: Response) {
    const { supplierId } = req.params;
    const { body } = req;

    const supplier = await this.supplierService.updateSupplier(
      body,
      supplierId
    );

    res
      .status(StatusCodes.OK)
      .json({ supplier, message: 'Supplier has been update' });
  }

  public async deleteSupplier(req: Request, res: Response) {
    const { supplierId } = req.params;
    const supplier = await this.supplierService.deleteSupplier(supplierId);

    res
      .status(StatusCodes.OK)
      .json({ supplier, message: 'Supplier has been deleted!' });
  }

  public async getSuppliers(req: Request, res: Response) {
    const { searchString, page, limit } = req.query;

    const suppliers = await this.supplierService.getSuppliers(
      page as string,
      searchString as string,
      limit as string
    );

    const total = await Supplier.countDocuments();

    res
      .status(StatusCodes.OK)
      .json({ suppliers, totalCount: suppliers.length, total });
  }
}
