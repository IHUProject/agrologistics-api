import { populateExpensesOpt } from '../config/populate'
import { BadRequestError, NotFoundError } from '../errors'
import { DefaultImage } from '../interfaces/enums'
import { IDataImgur, IExpense, IPopulate, IUserWithID } from '../interfaces/interfaces'
import Category from '../models/Category'
import Company from '../models/Company'
import Expanse from '../models/Expense'
import Supplier from '../models/Supplier'
import { DataLayerService } from './general-services/data-layer-service'
import { ImageService } from './general-services/image-service'

export class ExpenseService extends DataLayerService<IExpense> {
  private select: string
  private populateOptions: IPopulate[]
  private searchFields: string[]
  private imageService: ImageService

  constructor() {
    super(Expanse)
    this.populateOptions = populateExpensesOpt
    this.searchFields = ['status', 'paymentMethod', 'description']
    this.select = '-createdAt'
    this.imageService = new ImageService()
  }

  public async createExpense(
    payload: IExpense,
    files: Express.Multer.File[] | undefined,
    currentUser: IUserWithID
  ) {
    await super.validateData(payload)

    const { userId, company } = currentUser
    const images = await this.imageService.handleMultipleImages(files)
    const expense = await super.create({
      ...payload,
      images,
      createdBy: userId,
      company
    })

    const { _id, supplier, category } = expense
    await Company.updateOne({ _id: company }, { $push: { expenses: _id } })
    await Supplier.updateOne({ _id: supplier }, { $push: { expenses: _id } })
    await Category.updateOne({ _id: category }, { $push: { expenses: _id } })

    return this.getOne(_id, this.select, this.populateOptions)
  }

  public async getSingleExpense(expenseId: string) {
    return await this.getOne(expenseId, this.select, this.populateOptions)
  }

  public async getExpenses(page: string, searchString: string, limit: string) {
    return await this.getMany(
      page,
      searchString,
      this.select,
      this.searchFields,
      this.populateOptions,
      isNaN(Number(limit)) ? 10 : Number(limit)
    )
  }

  public async updateExpense(payload: IExpense, expenseId: string) {
    await super.validateData(payload)

    const { supplier, category } = payload
    if (supplier || category) {
      const expense = await this.getOne(expenseId)
      if (supplier && supplier !== expense.supplier) {
        await Supplier.updateOne({ _id: expense.supplier }, { $pull: { expenses: expenseId } })
        await Supplier.updateOne({ _id: supplier }, { $push: { expenses: expenseId } })
      }
      if (category && category !== expense.category) {
        await Category.updateOne({ _id: expense.category }, { $pull: { expenses: expenseId } })
        await Category.updateOne({ _id: category }, { $push: { expenses: expenseId } })
      }
    }

    return await this.update(expenseId, payload, this.select, this.populateOptions)
  }

  public async deleteExpense(expenseId: string) {
    const deletedExpense = await this.delete(expenseId)
    const { company, _id } = deletedExpense

    await Company.updateOne({ _id: company }, { $pull: { expenses: _id } })
    await Supplier.updateOne({ expenses: _id }, { $pull: { expenses: _id } })
    await Category.updateOne({ expenses: _id }, { $pull: { expenses: _id } })

    return deletedExpense
  }

  public async deleteImage(imageId: string, expenseId: string) {
    const expense = await Expanse.findOne({ 'images._id': imageId })
    if (!expense) {
      throw new NotFoundError('Expense did not found!')
    }

    expense.images = expense.images.filter(image => image?._id!.toString() !== imageId)

    await expense.save()

    const imageToDelete = expense.images.find(image => image._id!.toString() === imageId)

    const { deletehash } = imageToDelete as IDataImgur
    if (deletehash) {
      await this.imageService.deleteSingleImage(deletehash)
    }

    const updatedExpense = await this.getOne(expenseId)
    if (updatedExpense.images.length === 0) {
      updatedExpense.images.push({
        link: DefaultImage.EXPENSE_IMAGE,
        deletehash: ''
      })

      await updatedExpense.save()
    }

    await this.getOne(expenseId, this.select, this.populateOptions)
  }

  public async uploadImages(expenseId: string, files: Express.Multer.File[] | undefined) {
    const images = await this.imageService.handleMultipleImages(files)
    if (!images) {
      throw new BadRequestError('No images found!')
    }

    const expense = (await Expanse.findById(expenseId)) as IExpense

    images.forEach(image => {
      expense.images.push({
        link: image.link,
        deletehash: image.deletehash
      })
    })

    const defaultImageIndex = expense.images.findIndex(
      image => image.link === DefaultImage.EXPENSE_IMAGE
    )

    if (defaultImageIndex > -1) {
      expense.images.splice(defaultImageIndex, 1)
    }

    await expense.save()

    return await this.getOne(expenseId, this.select, this.populateOptions)
  }
}
