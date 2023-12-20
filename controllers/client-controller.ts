import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { ClientService } from '../services/client-service';

export class ClientController {
  private clientService: ClientService;
  constructor() {
    this.clientService = new ClientService();
  }

  public async createClient(req: Request, res: Response) {
    const { body } = req;
    const client = await this.clientService.createClient(body);

    res
      .status(StatusCodes.CREATED)
      .json({ client, message: 'Client has been created' });
  }

  public async getSingleClient(req: Request, res: Response) {
    const { clientId } = req.params;
    const client = await this.clientService.getSingleClient(clientId);
    res.status(StatusCodes.CREATED).json({ client });
  }

  public async updateClient(req: Request, res: Response) {
    const { clientId } = req.params;
    const { body } = req;
    const client = await this.clientService.updateClient(body, clientId);

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Client has been updated' });
  }

  public async getClients(req: Request, res: Response) {
    const { page, searchString } = req.query;

    const clients = await this.clientService.getClients(
      page as string,
      searchString as string
    );

    res.status(StatusCodes.OK).json({ clients, totalCount: clients.length });
  }

  public async deleteClient(req: Request, res: Response) {
    const { clientId } = req.params;
    const client = await this.clientService.deleteClient(clientId);

    res
      .status(StatusCodes.OK)
      .json({ client, message: 'Client has been deleted' });
  }
}
