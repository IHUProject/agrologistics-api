import { StatusCodes } from 'http-status-codes';
import { Response, Request } from 'express';
import { ProductService } from '../services/product-service';

export class ProductController {
  productService: ProductService;
  constructor() {
    this.productService = new ProductService();
  }

  public async createProduct(req: Request, res: Response) {
    const { body } = req;
    const product = await this.productService.createProduct(body);

    res
      .status(StatusCodes.CREATED)
      .json({ product, message: 'Product has been created!' });
  }

  public async getSingleProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const product = await this.productService.getSingleProduct(productId);
    res.status(StatusCodes.OK).json({ product });
  }

  public async updateProduct(req: Request, res: Response) {
    const { body } = req;
    const { productId } = req.params;
    const product = await this.productService.updateProduct(body, productId);

    res
      .status(StatusCodes.OK)
      .json({ product, message: 'Product has been updated!' });
  }

  public async deleteProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const product = await this.productService.deleteProduct(productId);

    res
      .status(StatusCodes.OK)
      .json({ product, message: 'Product has been deleted!' });
  }

  public async getProducts(req: Request, res: Response) {
    const { page, searchString } = req.query;

    const products = await this.productService.getProducts(
      page as string,
      searchString as string
    );

    res.status(StatusCodes.OK).json({ products, totalCount: products.length });
  }
}
