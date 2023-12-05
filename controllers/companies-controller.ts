import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';

export const createCompany = async (req: Request, res: Response) => {
  const companyService = new CompanyService(req, res);
  const company = await companyService.createCompany();
  res.status(StatusCodes.CREATED).json({ company });
};

export const getSingleCompany = async (req: Request, res: Response) => {
  const companyService = new CompanyService(req);
  const company = await companyService.getCompany();
  res.status(StatusCodes.OK).json({ company });
};

export const getCompanies = async (req: Request, res: Response) => {
  const companyService = new CompanyService(req);
  const companies = await companyService.getCompanies();
  res.status(StatusCodes.OK).json({ companies, totalCount: companies.length });
};

export const updateCompany = async (req: Request, res: Response) => {
  const companyService = new CompanyService(req);
  const company = await companyService.updateCompany();
  res.status(StatusCodes.OK).json({ company });
};

export const deleteCompany = async (req: Request, res: Response) => {
  const companyService = new CompanyService(req, res);
  const result = await companyService.deleteCompany();
  res.status(StatusCodes.OK).json({ result });
};

export const getEmployees = async (req: Request, res: Response) => {
  const companyService = new CompanyService(req, res);
  const employees = await companyService.getEmployees();
  res.status(StatusCodes.OK).json({ employees, total: employees.length });
};
