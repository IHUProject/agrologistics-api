import { StatusCodes } from 'http-status-codes';
import { Response, Request } from 'express';
import { ProductService } from '../services/product-service';
import { IUserWithID } from '../interfaces/interfaces';
import Product from '../models/Product';

export class ProductController {
  productService: ProductService;
  constructor() {
    this.productService = new ProductService();
  }

  public async createProduct(req: Request, res: Response) {
    const { body, currentUser } = req;

    const product = await this.productService.createProduct(
      body,
      currentUser as IUserWithID
    );

    res
      .status(StatusCodes.CREATED)
      .json({ product, message: 'Product has been created!' });
  }

  public async getSingleProduct(req: Request, res: Response) {
    const { id } = req.params;
    const product = await this.productService.getSingleProduct(id);
    res.status(StatusCodes.OK).json({ product });
  }

  public async updateProduct(req: Request, res: Response) {
    const { body } = req;
    const { id } = req.params;
    const product = await this.productService.updateProduct(body, id);

    res
      .status(StatusCodes.OK)
      .json({ product, message: 'Product has been updated!' });
  }

  public async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    const product = await this.productService.deleteProduct(id);

    res
      .status(StatusCodes.OK)
      .json({ product, message: 'Product has been deleted!' });
  }

  public async getProducts(req: Request, res: Response) {
    const { page, searchString, limit } = req.query;

    const products = await this.productService.getProducts(
      page as string,
      searchString as string,
      limit as string
    );

    const total = await Product.countDocuments();

    res
      .status(StatusCodes.OK)
      .json({ products, totalCount: products.length, total });
  }
}
