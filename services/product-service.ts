import { IPopulate, IProduct } from '../interfaces/interfaces';
import Company from '../models/Company';
import Product from '../models/Product';
import Purchase from '../models/Purchase';
import { DataLayerService } from './general-services/data-layer-service';

export class ProductService extends DataLayerService<IProduct> {
  select: string;
  populateOptions: IPopulate[];
  searchFields: string[];

  constructor() {
    super(Product);
    this.populateOptions = [
      {
        path: 'purchases',
        select: 'date totalAmount status',
      },
    ];
    this.searchFields = ['name', 'price', 'description'];
    this.select = '-createdAt';
  }

  public async createProduct(payload: IProduct) {
    const product = await super.create(payload);
    await Company.updateOne({}, { $push: { products: product._id } });
    return product;
  }

  public async getSingleProduct(productId: string) {
    return await this.getOne(productId, this.select, this.populateOptions);
  }

  public async getProducts(page: string, searchString: string) {
    return await this.getMany(
      page,
      this.select,
      searchString,
      this.searchFields,
      this.populateOptions
    );
  }

  public async updateProduct(payload: IProduct, productId: string) {
    return await this.update(
      productId,
      payload,
      this.select,
      this.populateOptions
    );
  }

  public async deleteProduct(productId: string) {
    const deletedProduct = await this.delete(productId);
    await Company.updateOne({}, { $pull: { products: productId } });
    await Purchase.updateOne({}, { $pull: { products: productId } });
    return deletedProduct;
  }
}
