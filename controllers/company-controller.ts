import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';
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
      currentUser,
      file
    );

    const token = await reattachTokens(res, currentUser.userId.toString());

    res
      .status(StatusCodes.CREATED)
      .json({ company, token,message: 'Company had been successfully created!' });
  }

  public async getCompany(req: Request, res: Response) {
    const company = await this.companyService.getCompany();
    res.status(StatusCodes.OK).json({ company });
  }

  public async updateCompany(req: Request, res: Response) {
    const { body, file } = req;
    const { id } = req.params;

    const company = await this.companyService.updateCompany(body, id, file);

    res
      .status(StatusCodes.OK)
      .json({ company, message: 'Company had been successfully updated!' });
  }

  public async deleteCompany(req: Request, res: Response) {
    const { id } = req.params;
    const { currentUser } = req;
    const { userId } = currentUser;

    const company = await this.companyService.deleteCompany(id);
    const token = await reattachTokens(res, userId.toString());

    res
      .status(StatusCodes.OK)
      .json({ company, token, message: 'Company have been deleted!' });
  }

  public async isCompanyExists(req: Request, res: Response) {
    const isExists = await this.companyService.isCompanyExists();
    res.status(StatusCodes.OK).json({ isExists });
  }
}
