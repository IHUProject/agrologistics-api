import { Response, Request } from 'express';
import { CompanyService } from '../services/company-service';
import { StatusCodes } from 'http-status-codes';
import { ICompany } from '../interfaces/interfaces';

export const createCompany = async (req: Request, res: Response) => {
  const companyService: CompanyService = new CompanyService(req);
  const company: ICompany = await companyService.createCompany();
  res.status(StatusCodes.CREATED).json({ company });
};

export const getSingleCompany = (req: Request, res: Response) => {
  res.status(200).json({ msg: 'single company' });
};

export const getCompanies = async (req: Request, res: Response) => {
  const companyService: CompanyService = new CompanyService(req);
  const companies: ICompany[] = await companyService.getCompanies();
  res
    .status(StatusCodes.CREATED)
    .json({ companies, totalCount: companies.length });
};

export const updateCompany = (req: Request, res: Response) => {
  res.status(200).json({ msg: 'update company' });
};

export const deleteCompany = (req: Request, res: Response) => {
  res.status(200).json({ msg: 'delete company' });
};
