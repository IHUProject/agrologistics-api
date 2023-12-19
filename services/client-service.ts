import { BadRequestError } from '../errors';
import { IClient, IPopulate } from '../interfaces/interfaces';
import Client from '../models/Client';
import Company from '../models/Company';
import Purchase from '../models/Purchase';
import { DataLayerService } from './general-services/data-layer-service';

export class ClientService extends DataLayerService<IClient> {
  select: string;
  populateOptions: IPopulate[];
  searchFields: string[];

  constructor() {
    super(Client);
    this.populateOptions = [
      {
        path: 'purchases',
        select: 'date totalAmount status',
      },
    ];
    this.searchFields = ['fullName', 'company'];
    this.select = '-createdAt';
  }

  public async createClient(payload: IClient) {
    const isPhoneUnique = await Client.findOne({ phone: payload.phone });
    if (isPhoneUnique) {
      throw new BadRequestError('The phone number is already in use!');
    }

    this.validateData(payload);
    const client = await super.create(payload);
    await Company.updateOne({}, { $push: { clients: client._id } });

    return await this.getOne(client._id, this.select, this.populateOptions);
  }

  public async getSingleClient(clientId: string) {
    return await this.getOne(clientId, this.select, this.populateOptions);
  }

  public async getClients(page: string, searchString: string) {
    return await this.getMany(
      page,
      this.select,
      searchString,
      this.searchFields,
      this.populateOptions
    );
  }

  public async deleteClient(clientId: string) {
    await Purchase.updateMany({ client: clientId }, { $unset: { client: '' } });
    await Company.updateOne({}, { $pull: { clients: clientId } });

    return await this.delete(clientId);
  }

  public async updateClient(payload: IClient, clientId: string) {
    return await this.update(
      clientId,
      payload,
      this.select,
      this.populateOptions
    );
  }
}
