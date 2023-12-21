import { IPopulate, ISupplier } from '../interfaces/interfaces';
import Supplier from '../models/Supplier';
import { DataLayerService } from './general-services/data-layer-service';

export class SupplierService extends DataLayerService<ISupplier> {
  private select: string;
  private populateOptions: IPopulate[];
  private searchFields: string[];

  constructor() {
    super(Supplier);
    this.populateOptions = [
      {
        path: 'expenses',
        select: 'date totalAmount',
      },
    ];
    this.searchFields = ['email', 'address', 'fullName'];
    this.select = '-createdAt';
  }

  public async createSupplier(payload: ISupplier) {}

  public async getSingleSupplier(supplierId: string) {
    return await this.getOne(supplierId, this.select, this.populateOptions);
  }

  public async getSuppliers(page: string, searchString: string) {
    return await this.getMany(
      page,
      this.select,
      searchString,
      this.searchFields,
      this.populateOptions
    );
  }

  public async deleteSupplier(supplierId: string) {}

  public async updatePurchase(payload: ISupplier, purchaseId: string) {}
}
