import { StatusCodes } from 'http-status-codes';
import { IUserWithID } from '../interfaces/interfaces';
import { CategoryService } from '../services/category-service';
import { Request, Response } from 'express';
import Category from '../models/Category';

export class CategoryController {
  private categoryService: CategoryService;
  constructor() {
    this.categoryService = new CategoryService();
  }

  public async createCategory(req: Request, res: Response) {
    const { body, currentUser } = req;

    const client = await this.categoryService.createCategory(
      body,
      currentUser as IUserWithID
    );

    res
      .status(StatusCodes.CREATED)
      .json({ client, message: 'Category has been created' });
  }

  public async getSingleCategory(req: Request, res: Response) {
    const { id } = req.params;
    const category = await this.categoryService.getSingleCategory(id);
    res.status(StatusCodes.CREATED).json({ category });
  }

  public async updateCategory(req: Request, res: Response) {
    const { id } = req.params;
    const { body } = req;
    const client = await this.categoryService.updateCategory(body, id);

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Category has been updated' });
  }

  public async getCategories(req: Request, res: Response) {
    const { page, searchString, limit } = req.query;

    const categories = await this.categoryService.getCategories(
      page as string,
      searchString as string,
      limit as string
    );

    const total = await Category.countDocuments();

    res
      .status(StatusCodes.OK)
      .json({ categories, totalCount: categories.length, total });
  }

  public async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;
    const category = await this.categoryService.deleteCategory(id);

    res
      .status(StatusCodes.OK)
      .json({ category, message: 'Category has been deleted' });
  }
}
