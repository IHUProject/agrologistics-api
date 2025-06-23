import { ExpenseService } from '../../business/expense-service'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { normalizeFilesInput } from '../../common/helpers/handle-images'
import Expanse from '../../data-access/models/Expense'

export class ExpenseController {
  private expenseService: ExpenseService
  constructor() {
    this.expenseService = new ExpenseService()
  }

  public async createExpense(req: Request, res: Response) {
    const { body, currentUser, files } = req

    const fileArray = normalizeFilesInput(files)
    const client = await this.expenseService.createExpense(
      body,
      fileArray,
      currentUser
    )

    res
      .status(StatusCodes.CREATED)
      .json({ client, message: 'Expense has been created' })
  }

  public async getSingleExpense(req: Request, res: Response) {
    const { id } = req.params
    const expense = await this.expenseService.getSingleExpense(id)
    res.status(StatusCodes.OK).json({ expense })
  }

  public async updateExpense(req: Request, res: Response) {
    const { id } = req.params
    const { body } = req
    const expense = await this.expenseService.updateExpense(body, id)

    res
      .status(StatusCodes.OK)
      .json({ expense, message: 'Expense has been updated' })
  }

  public async getExpenses(req: Request, res: Response) {
    const { page, searchString, limit } = req.query

    const expenses = await this.expenseService.getExpenses(
      page as string,
      searchString as string,
      limit as string
    )

    const total = await Expanse.countDocuments()

    res
      .status(StatusCodes.OK)
      .json({ expenses, totalCount: expenses.length, total })
  }

  public async deleteCategory(req: Request, res: Response) {
    const { id } = req.params
    const expense = await this.expenseService.deleteExpense(id)

    res
      .status(StatusCodes.OK)
      .json({ expense, message: 'Expense has been deleted' })
  }

  public async deleteImage(req: Request, res: Response) {
    const { id } = req.params
    const { imageId } = req.body

    const expense = await this.expenseService.deleteImage(imageId, id)

    res
      .status(StatusCodes.OK)
      .json({ expense, message: "Expense's image has been deleted" })
  }

  public async uploadImages(req: Request, res: Response) {
    const { id } = req.params
    const { files } = req

    const fileArray = normalizeFilesInput(files)
    const expense = await this.expenseService.uploadImages(id, fileArray)

    res
      .status(StatusCodes.OK)
      .json({ expense, message: "Expense's new images has been uploaded" })
  }
}
