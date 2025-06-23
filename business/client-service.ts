import { populateClientOpt } from '../config/populate'
import { BadRequestError } from '../common/errors'
import { IClient, IPopulate, IUserWithID } from '../types/interfaces'
import Client from '../data-access/models/Client'
import Company from '../data-access/models/Company'
import Purchase from '../data-access/models/Purchase'
import { BaseRepository } from '../data-access/base-repository'

export class ClientService extends BaseRepository<IClient> {
  private select: string
  private populateOptions: IPopulate[]
  private searchFields: string[]

  constructor() {
    super(Client)
    this.populateOptions = populateClientOpt
    this.searchFields = ['firstName', 'lastName']
    this.select = '-createdAt'
  }

  public async createClient(payload: IClient, currentUser: IUserWithID) {
    await super.validateData(payload)

    const { userId, company } = currentUser
    const isPhoneUnique = await Client.findOne({ phone: payload.phone })

    if (isPhoneUnique) {
      throw new BadRequestError('The phone number is already in use!')
    }

    const client = await super.create({
      ...payload,
      createdBy: userId,
      company
    })
    const { _id } = client

    await Company.updateOne({ _id: company }, { $push: { clients: _id } })

    return await this.getOne(_id, this.select, this.populateOptions)
  }

  public async getSingleClient(clientId: string) {
    return await this.getOne(clientId, this.select, this.populateOptions)
  }

  public async getClients(
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
    )
  }

  public async deleteClient(clientId: string) {
    const deleteClient = (await this.delete(clientId)) as IClient

    await Purchase.updateMany(
      { client: clientId },
      { $unset: { client: null } }
    )
    await Company.updateOne(
      { _id: deleteClient.company },
      { $pull: { clients: clientId } }
    )

    return deleteClient
  }

  public async updateClient(payload: IClient, clientId: string) {
    await super.validateData(payload)
    return await this.update(
      clientId,
      payload,
      this.select,
      this.populateOptions
    )
  }
}
