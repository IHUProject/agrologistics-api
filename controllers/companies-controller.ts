import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  public async createCompany(req: Request, res: Response) {
    const company = await this.companyService.createCompany(req, res);
    res.status(StatusCodes.CREATED).json({ company });
  }

  public async getSingleCompany(req: Request, res: Response) {
    const company = await this.companyService.getCompany(req);
    res.status(StatusCodes.OK).json({ company });
  }

  public async getCompanies(req: Request, res: Response) {
    const companies = await this.companyService.getCompanies(req);
    res
      .status(StatusCodes.OK)
      .json({ companies, totalCount: companies.length });
  }

  public async updateCompany(req: Request, res: Response) {
    const company = await this.companyService.updateCompany(req);
    res.status(StatusCodes.OK).json({ company });
  }

  public async deleteCompany(req: Request, res: Response) {
    const result = await this.companyService.deleteCompany(req, res);
    res.status(StatusCodes.OK).json({ result });
  }

  public async getEmployees(req: Request, res: Response) {
    const employees = await this.companyService.getEmployees(req);
    res.status(StatusCodes.OK).json({ employees, total: employees.length });
  }
}
