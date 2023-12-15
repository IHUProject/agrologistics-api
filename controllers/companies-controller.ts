import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';
import { IUserWithID } from '../interfaces/interfaces';
import { reattachTokens } from '../helpers/re-attack-tokens';
export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  public async createCompany(req: Request, res: Response) {
    const { body, currentUser } = req;
    const { file } = req;

    const company = await this.companyService.createCompany(
      body,
      currentUser as IUserWithID,
      file
    );

    await reattachTokens(res, (currentUser as IUserWithID)?.userId.toString());
    res
      .status(StatusCodes.CREATED)
      .json({ company, msg: 'Company had been successfully created' });
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

    res
      .status(StatusCodes.OK)
      .json({ company, msg: 'Company had been successfully updated' });
  }

  public async deleteCompany(req: Request, res: Response) {
    const { companyId } = req.params;

    const result = await this.companyService.deleteCompany(companyId);

    const { currentUser } = req;
    const { userId } = currentUser as IUserWithID;
    await reattachTokens(res, userId.toString());

    res.status(StatusCodes.OK).json({ result });
  }

  public async addToCompany(req: Request, res: Response) {
    const { userId } = req.params;
    const { role } = req.body;

    const result = await this.companyService.addToCompany(userId, role);

    res.status(StatusCodes.OK).json({ result });
  }

  public async removeFromCompany(req: Request, res: Response) {
    const { userId } = req.params;
    const result = await this.companyService.removeFromCompany(userId);
    res.status(StatusCodes.OK).json({ result });
  }
}
