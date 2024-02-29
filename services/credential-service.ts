import { populateCredOpt } from '../config/populate';
import { checkIsFirstDocument } from '../helpers/is-first-doc';
import { ICredential, IPopulate, IUserWithID } from '../interfaces/interfaces';
import Company from '../models/Company';
import Credential from '../models/Credential';
import { DataLayerService } from './general-services/data-layer-service';

export class CredentialService extends DataLayerService<ICredential> {
  private select: string;
  private populateOptions: IPopulate[];

  constructor() {
    super(Credential);
    this.select = '-createdAt';
    this.populateOptions = populateCredOpt;
  }

  public async createCreds(payload: ICredential, currentUser: IUserWithID) {
    await super.validateData(payload);
    await checkIsFirstDocument(Credential);

    const { userId, company } = currentUser;
    const creds = await super.create({
      ...payload,
      createdBy: userId,
      company,
    });

    const { _id } = creds;
    await Company.updateOne({ _id: company }, { $set: { credentials: _id } });

    return this.getOne(_id, this.select, this.populateOptions);
  }

  public async getCreds() {
    return await Credential.findOne()
      .select(this.select)
      .populate(this.populateOptions);
  }

  public async updateCreds(payload: ICredential, id: string) {
    await super.validateData(payload);
    return await this.update(id, payload, this.select, this.populateOptions);
  }

  public async deleteCreds(id: string) {
    const deletedCreds = await this.delete(id);

    const { company, _id } = deletedCreds;
    await Company.updateOne({ _id: company }, { $unset: { credentials: _id } });

    return deletedCreds;
  }
}
