import { createSearchQuery } from '../helpers/create-search-query';
import { IProduct } from '../interfaces/interfaces';
import Company from '../models/Company';
import Product from '../models/Product';

export class ProductService {
  public async createProduct(payload: IProduct) {
    const { name, price, description } = payload;

    const product = await Product.create({
      name,
      price,
      description,
    });

    await Company.updateOne({}, { $push: { products: product._id } });

    return await Product.findById(product._id).select('-createdAt');
  }

  public async getSingleProduct(productId: string) {
    return await Product.findById(productId).select('-createdAt');
  }

  public async getProducts(page: string, searchString: string) {
    const limit = 10;
    const skip = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<IProduct>(searchString, [
      'name',
      'price',
      'description',
    ]);

    return (await Product.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .select('-createdAt')) as IProduct[];
  }

  public async updateProduct(payload: IProduct, productId: string) {
    const { name, price, description } = payload;

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        price,
        description,
      },
      { new: true, runValidators: true }
    ).select('-createdAt');

    return product;
  }

  public async deleteProduct(productId: string) {
    await Company.updateOne({}, { $pull: { products: productId } });
    return await Product.findByIdAndDelete(productId).select('-createdAt');
  }
}
