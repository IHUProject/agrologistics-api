import { populateCategoryOpt } from '../config/populate';
import { ICategory, IPopulate, IUserWithID } from '../interfaces/interfaces';
import Category from '../models/Category';
import Company from '../models/Company';
import Expanse from '../models/Expense';
import { DataLayerService } from './general-services/data-layer-service';

export class CategoryService extends DataLayerService<ICategory> {
  private select: string;
  private populateOptions: IPopulate[];
  private searchFields: string[];

  constructor() {
    super(Category);
    this.populateOptions = populateCategoryOpt;
    this.searchFields = ['name'];
    this.select = '-createdAt';
  }

  public async createCategory(payload: ICategory, currentUser: IUserWithID) {
    const { userId, company } = currentUser;

    const category = await super.create({
      ...payload,
      createdBy: userId,
      company,
    });

    const { _id } = category;
    await Company.updateOne({ _id: company }, { $push: { categories: _id } });

    return this.getOne(_id, this.select, this.populateOptions);
  }

  public async getSingleCategory(categoryId: string) {
    return await this.getOne(categoryId, this.select, this.populateOptions);
  }

  public async getCategories(
    page: string,
    searchString: string,
    limit: string
  ) {
    return await this.getMany(
      page,
      searchString,
      this.select,
      this.searchFields,
      this.populateOptions,
      isNaN(Number(limit)) ? 10 : Number(limit)
    );
  }

  public async updateCategory(payload: ICategory, categoryId: string) {
    return await this.update(
      categoryId,
      payload,
      this.select,
      this.populateOptions
    );
  }

  public async deleteCategory(categoryId: string) {
    const deletedCategory = await this.delete(categoryId);

    const { company, _id } = deletedCategory;

    await Company.updateOne({ _id: company }, { $pull: { categories: _id } });
    await Expanse.updateMany({ category: _id }, { $unset: { category: _id } });

    return deletedCategory;
  }
}
