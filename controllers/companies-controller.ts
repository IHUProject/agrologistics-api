import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';
import { ICompany, IUserWithID } from '../interfaces/interfaces';
import { constructPayload } from '../helpers/construct-payload';
import { reattachTokens } from '../helpers/re-attack-tokens';
export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  public async createCompany(req: Request, res: Response) {
    const { body, currentUser } = req;
    const { file } = req;

    const payload = constructPayload<ICompany>(req, body);
    const company = await this.companyService.createCompany(
      payload,
      currentUser as IUserWithID,
      file,
      res
    );

    res.status(StatusCodes.CREATED).json({ company });
  }

  public async getCompany(req: Request, res: Response) {
    const company = await this.companyService.getCompany();

    res.status(StatusCodes.OK).json({ company });
  }

  public async updateCompany(req: Request, res: Response) {
    const { body, file } = req;
    const { companyId } = req.params;

    const company = await this.companyService.updateCompany(
      body,
      companyId,
      file
    );

    res.status(StatusCodes.OK).json({ company });
  }

  public async deleteCompany(req: Request, res: Response) {
    const { companyId } = req.params;

    const result = await this.companyService.deleteCompany(companyId);

    const { currentUser } = req;
    const { userId } = currentUser as IUserWithID;
    await reattachTokens(res, userId.toString());

    res.status(StatusCodes.OK).json({ result });
  }
}
