import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { ClientService } from '../../business/client-service'
import Client from '../../data-access/models/Client'

export class ClientController {
  private clientService: ClientService
  constructor() {
    this.clientService = new ClientService()
  }

  public async createClient(req: Request, res: Response) {
    const { body, currentUser } = req

    const client = await this.clientService.createClient(body, currentUser)

    res
      .status(StatusCodes.CREATED)
      .json({ client, message: 'Client has been created' })
  }

  public async getSingleClient(req: Request, res: Response) {
    const { id } = req.params
    const client = await this.clientService.getSingleClient(id)
    res.status(StatusCodes.OK).json({ client })
  }

  public async updateClient(req: Request, res: Response) {
    const { id } = req.params
    const { body } = req
    const client = await this.clientService.updateClient(body, id)

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Client has been updated' })
  }

  public async getClients(req: Request, res: Response) {
    const { page, searchString, limit } = req.query

    const clients = await this.clientService.getClients(
      page as string,
      searchString as string,
      limit as string
    )

    const total = await Client.countDocuments()

    res
      .status(StatusCodes.OK)
      .json({ clients, totalCount: clients.length, total })
  }

  public async deleteClient(req: Request, res: Response) {
    const { id } = req.params
    const client = await this.clientService.deleteClient(id)

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Client has been deleted' })
  }
}
