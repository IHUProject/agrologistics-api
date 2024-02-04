import { populateExpensesOpt } from '../config/populate';
import { IExpense, IPopulate, IUserWithID } from '../interfaces/interfaces';
import Category from '../models/Category';
import Company from '../models/Company';
import Expanse from '../models/Expense';
import Supplier from '../models/Supplier';
import { DataLayerService } from './general-services/data-layer-service';
import { ImageService } from './general-services/image-service';

export class ExpenseService extends DataLayerService<IExpense> {
  private select: string;
  private populateOptions: IPopulate[];
  private searchFields: string[];
  private imageService: ImageService;

  constructor() {
    super(Expanse);
    this.populateOptions = populateExpensesOpt;
    this.searchFields = ['status', 'paymentMethod', 'description'];
    this.select = '-createdAt';
    this.imageService = new ImageService();
  }

  public async createExpense(
    payload: IExpense,
    files: Express.Multer.File[] | undefined,
    currentUser: IUserWithID
  ) {
    const { userId, company } = currentUser;

    const images = await this.imageService.handleMultipleImages(files);

    const expense = await super.create({
      ...payload,
      images,
      createdBy: userId,
      company,
    });

    const { _id, supplier, category } = expense;
    await Company.updateOne({ _id: company }, { $push: { expenses: _id } });
    await Supplier.updateOne({ _id: supplier }, { $push: { expenses: _id } });
    await Category.updateOne({ _id: category }, { $push: { expenses: _id } });

    return this.getOne(_id, this.select, this.populateOptions);
  }

  public async getSingleExpense(expenseId: string) {
    return await this.getOne(expenseId, this.select, this.populateOptions);
  }

  public async getExpenses(page: string, searchString: string, limit: string) {
    return await this.getMany(
      page,
      searchString,
      this.select,
      this.searchFields,
      this.populateOptions,
      isNaN(Number(limit)) ? 10 : Number(limit)
    );
  }

  public async updateExpense(payload: IExpense, expenseId: string) {
    await this.update(expenseId, payload, this.select, this.populateOptions);

    const { supplier, category } = payload;
    if (supplier || category) {
      const expense = await this.getOne(expenseId);
      if (supplier && supplier !== expense.supplier) {
        await Supplier.updateOne(
          { _id: expense.supplier },
          { $pull: { expenses: expenseId } }
        );
        await Supplier.updateOne(
          { _id: supplier },
          { $push: { expenses: expenseId } }
        );
      }
      if (category && category !== expense.category) {
        await Category.updateOne(
          { _id: expense.category },
          { $pull: { expenses: expenseId } }
        );
        await Category.updateOne(
          { _id: category },
          { $push: { expenses: expenseId } }
        );
      }
    }

    return await this.getOne(expenseId);
  }

  public async deleteExpense(expenseId: string) {
    const deletedExpense = await this.delete(expenseId);

    const { company, _id } = deletedExpense;
    await Company.updateOne({ _id: company }, { $pull: { expenses: _id } });
    await Supplier.updateMany({ expenses: _id }, { $pull: { expenses: _id } });
    await Category.updateMany({ expenses: _id }, { $pull: { expenses: _id } });

    return deletedExpense;
  }
}
