import { populateSupplierOpt } from '../config/populate';
import { IPopulate, ISupplier } from '../interfaces/interfaces';
import Company from '../models/Company';
import Expanse from '../models/Expense';
import Supplier from '../models/Supplier';
import { DataLayerService } from './general-services/data-layer-service';

export class SupplierService extends DataLayerService<ISupplier> {
  private select: string;
  private populateOptions: IPopulate[];
  private searchFields: string[];

  constructor() {
    super(Supplier);
    this.populateOptions = populateSupplierOpt;
    this.searchFields = ['email', 'address', 'fullName', 'lastName'];
    this.select = '-createdAt';
  }

  public async createSupplier(payload: ISupplier) {
    const supplier = await super.create(payload);

    const { _id, company } = supplier;
    await Company.updateOne({ _id: company }, { $push: { suppliers: _id } });

    return await this.getOne(_id, this.select, this.populateOptions);
  }

  public async getSingleSupplier(supplierId: string) {
    return await this.getOne(supplierId, this.select, this.populateOptions);
  }

  public async getSuppliers(page: string, searchString: string, limit: string) {
    return await this.getMany(
      page,
      this.select,
      searchString,
      this.searchFields,
      this.populateOptions,
      Number(limit)
    );
  }

  public async deleteSupplier(supplierId: string) {
    const deletedSupplier = (await this.delete(supplierId)) as ISupplier;

    const { _id, company } = deletedSupplier;
    await Company.updateOne({ _id: company }, { $pull: { suppliers: _id } });
    await Expanse.updateOne({ supplier: _id }, { $pull: { purchases: _id } });

    return deletedSupplier;
  }

  public async updateSupplier(payload: ISupplier, supplierId: string) {
    return await this.update(
      supplierId,
      payload,
      this.select,
      this.populateOptions
    );
  }
}
