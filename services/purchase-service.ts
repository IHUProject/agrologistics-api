import { populatePurchaseOpt } from '../config/populate';
import { BadRequestError } from '../errors';
import { IPopulate, IPurchase, IUserWithID } from '../interfaces/interfaces';
import Client from '../models/Client';
import Company from '../models/Company';
import Product from '../models/Product';
import Purchase from '../models/Purchase';
import { DataLayerService } from './general-services/data-layer-service';

export class PurchaseService extends DataLayerService<IPurchase> {
  private select: string;
  private populateOptions: IPopulate[];
  private searchFields: string[];

  constructor() {
    super(Purchase);
    this.populateOptions = populatePurchaseOpt;
    this.searchFields = ['status', 'paymentMethod'];
    this.select = '-createdAt';
  }

  public async createPurchase(payload: IPurchase, currentUser: IUserWithID) {
    const { products, client } = payload;
    const { userId, company } = currentUser;

    const uniqueProducts = new Set(products);
    if (uniqueProducts.size !== products.length) {
      throw new BadRequestError('Duplicate product found in the products.');
    }

    const purchase = await super.create({
      ...payload,
      createdBy: userId,
      company,
    });

    const { _id } = purchase;
    await Company.updateOne({ _id: company }, { $push: { purchases: _id } });
    await Client.updateOne({ _id: client }, { $push: { purchases: _id } });

    for (const id of products) {
      await Product.updateOne({ _id: id }, { $push: { purchases: _id } });
    }

    return await this.getOne(_id, this.select, this.populateOptions);
  }

  public async getSinglePurchase(purchaseId: string) {
    return await this.getOne(purchaseId, this.select, this.populateOptions);
  }

  public async getPurchases(page: string, searchString: string, limit: string) {
    return await this.getMany(
      page,
      searchString,
      this.select,
      this.searchFields,
      this.populateOptions,
      isNaN(Number(limit)) ? 10 : Number(limit)
    );
  }

  public async deletePurchase(purchaseId: string) {
    const deletedPurchase = await this.delete(purchaseId);

    const { _id, client, company } = deletedPurchase;
    await Company.updateOne({ _id: company }, { $pull: { purchases: _id } });
    await Client.updateOne({ _id: client }, { $pull: { purchases: _id } });
    await Product.updateMany({ purchases: _id }, { $pull: { purchases: _id } });

    return deletedPurchase;
  }

  public async updatePurchase(payload: IPurchase, purchaseId: string) {
    const purchase = await this.update(
      purchaseId,
      payload,
      this.select,
      this.populateOptions
    );

    const { client, products } = payload;

    if (client && client !== purchase.client) {
      await Client.updateOne(
        { _id: purchase.client },
        { $pull: { purchases: purchaseId } }
      );
      await Client.updateOne(
        { _id: client },
        { $push: { purchases: purchaseId } }
      );
    }

    if (products?.length) {
      const newProductIds = new Set(products);
      const existingProductIds = new Set(purchase.products);

      for (const productId of existingProductIds) {
        if (!newProductIds.has(productId)) {
          await Product.updateOne(
            { _id: productId },
            { $pull: { purchases: purchaseId } }
          );
        }
      }

      for (const productId of newProductIds) {
        if (!existingProductIds.has(productId)) {
          await Product.updateOne(
            { _id: productId },
            { $push: { purchases: purchaseId } }
          );
        }
      }
    }

    return await this.getOne(purchaseId);
  }
}
