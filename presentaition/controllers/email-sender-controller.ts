import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { EmailSenderService } from '../../business/email-serder-service'

export class EmailSenderController {
  senderService: EmailSenderService
  constructor() {
    this.senderService = new EmailSenderService()
  }

  public async sendUnsendExpenses(req: Request, res: Response) {
    await this.senderService.sendExpenses()
    res.status(StatusCodes.OK).json({
      message:
        'Unsend expenses have beed successfully send to the accountant of the company!'
    })
  }

  public async sendUnsendPurchases(req: Request, res: Response) {
    await this.senderService.sendPurchases()
    res.status(StatusCodes.OK).json({
      message:
        'Unsend purchases have beed successfully send to the accountant of the company!'
    })
  }

  public async sendSingleExpense(req: Request, res: Response) {
    const { id } = req.params
    await this.senderService.sendSingleExpense(id)
    res.status(StatusCodes.OK).json({
      message:
        'Expense have beed successfully send to the accountant of the company!'
    })
  }

  public async sendSinglePurchase(req: Request, res: Response) {
    const { id } = req.params
    await this.senderService.sendSinglePurchase(id)
    res.status(StatusCodes.OK).json({
      message:
        'Purchase have beed successfully send to the accountant of the company!'
    })
  }
}
