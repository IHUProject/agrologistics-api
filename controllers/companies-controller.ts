import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';
import { ICompany, IUserWithID } from '../interfaces/interfaces';
import { constructPayload } from '../helpers/construct-payload';

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  public async createCompany(req: Request, res: Response) {
    const { body, files, currentUser } = req;

    const payload = constructPayload<ICompany>(req, body);
    const company = await this.companyService.createCompany(
      payload,
      files,
      currentUser as IUserWithID,
      res
    );

    res.status(StatusCodes.CREATED).json({ company });
  }

  public async getSingleCompany(req: Request, res: Response) {
    const { companyId } = req.params;

    const company = await this.companyService.getCompany(companyId);

    res.status(StatusCodes.OK).json({ company });
  }

  public async getCompanies(req: Request, res: Response) {
    const { page, searchString } = req.query;

    const companies = await this.companyService.getCompanies(
      page as string,
      searchString as string
    );

    res
      .status(StatusCodes.OK)
      .json({ companies, totalCount: companies.length });
  }

  public async updateCompany(req: Request, res: Response) {
    const { body, files } = req;
    const { companyId } = req.params;

    const company = await this.companyService.updateCompany(
      body,
      files,
      companyId
    );

    res.status(StatusCodes.OK).json({ company });
  }

  public async deleteCompany(req: Request, res: Response) {
    const { currentUser } = req;
    const { body } = req;
    const { companyId } = req.params;

    const result = await this.companyService.deleteCompany(
      companyId,
      body.postmanRequest || false,
      currentUser as IUserWithID,
      res
    );

    res.status(StatusCodes.OK).json({ result });
  }

  public async getEmployees(req: Request, res: Response) {
    const { currentUser } = req;
    const { companyId } = req.params;
    const { page, searchString } = req.query;

    const employees = await this.companyService.getEmployees(
      companyId,
      page as string,
      searchString as string,
      currentUser as IUserWithID
    );

    res.status(StatusCodes.OK).json({ employees, total: employees.length });
  }
}
