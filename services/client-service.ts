import { BadRequestError } from '../errors';
import { createSearchQuery } from '../helpers/create-search-query';
import { IClient } from '../interfaces/interfaces';
import Client from '../models/Client';
import Company from '../models/Company';
import Purchase from '../models/Purchase';

export class ClientService {
  public async createClient(payload: IClient) {
    const { fullName, phone, company, address } = payload;

    const isPhoneUnique = await Client.findOne({ phone: phone });
    if (isPhoneUnique) {
      throw new BadRequestError('The phone number is already in use!');
    }

    const client = await Client.create({
      fullName,
      phone,
      company,
      address,
    });

    await Company.updateOne({}, { $push: { clients: client._id } });

    return await Client.findById(client._id).select('-createAt');
  }

  public async getOneClient(clientId: string) {
    return await Client.findById(clientId).select('-createdAt').populate({
      path: 'purchases',
      select: 'date totalAmount status _id',
    });
  }

  public async getClients(page: string, searchString: string) {
    const limit = 10;
    const skip = (Number(page || 1) - 1) * limit;

    const searchQuery = createSearchQuery<IClient>(searchString, [
      'fullName',
      'company',
    ]);

    return (await Client.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .select('-createdAt')) as IClient[];
  }

  public async deleteClient(clientId: string) {
    await Purchase.updateOne({ client: clientId }, { $unset: { client: '' } });
    await Company.updateOne({}, { $pull: { clients: clientId } });
    return await Client.findByIdAndDelete(clientId).select('-createdAt');
  }

  public async updateClient(payload: IClient, clientId: string) {
    const { fullName, company, address, phone } = payload;

    const client = await Client.findByIdAndUpdate(
      clientId,
      {
        fullName,
        company,
        address,
        phone,
      },
      { new: true, runValidators: true }
    ).select('-createdAt');

    return client;
  }
}
