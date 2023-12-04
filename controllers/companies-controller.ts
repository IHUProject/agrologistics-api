import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';
import { ICompany } from '../interfaces/interfaces';

export const createCompany = async (req: Request, res: Response) => {
  const companyService: CompanyService = new CompanyService(req, res);
  const company: ICompany = await companyService.createCompany();
  res.status(StatusCodes.CREATED).json({ company });
};

export const getSingleCompany = async (req: Request, res: Response) => {
  const companyService: CompanyService = new CompanyService(req);
  const company: ICompany = await companyService.getCompany();
  res.status(StatusCodes.OK).json({ company });
};

export const getCompanies = async (req: Request, res: Response) => {
  const companyService: CompanyService = new CompanyService(req);
  const companies: ICompany[] = await companyService.getCompanies();
  res.status(StatusCodes.OK).json({ companies, totalCount: companies.length });
};

export const updateCompany = async (req: Request, res: Response) => {
  const companyService: CompanyService = new CompanyService(req);
  const company: ICompany | null = await companyService.updateCompany();
  res.status(StatusCodes.OK).json({ company });
};

export const deleteCompany = async (req: Request, res: Response) => {
  const companyService: CompanyService = new CompanyService(req, res);
  const result: string = await companyService.deleteCompany();
  res.status(StatusCodes.OK).json({ result });
};
