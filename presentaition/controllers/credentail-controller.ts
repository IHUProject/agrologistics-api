import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { CredentialService } from '../../business/credential-service'

export class CredsController {
  private credService: CredentialService
  constructor() {
    this.credService = new CredentialService()
  }

  public async createCreds(req: Request, res: Response) {
    const { body, currentUser } = req

    const client = await this.credService.createCreds(body, currentUser)

    res
      .status(StatusCodes.CREATED)
      .json({ client, message: 'Credentials has been created' })
  }

  public async getCreds(req: Request, res: Response) {
    const credentails = await this.credService.getCreds()
    res.status(StatusCodes.OK).json({ credentails })
  }

  public async updateCreds(req: Request, res: Response) {
    const { id } = req.params
    const { body } = req
    const client = await this.credService.updateCreds(body, id)

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Credentails has been updated' })
  }

  public async deleteCreds(req: Request, res: Response) {
    const { id } = req.params
    const client = await this.credService.deleteCreds(id)

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Creds has been deleted' })
  }
}
