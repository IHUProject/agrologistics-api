import express, { Router } from 'express';
import { authenticateUser } from '../middlewares/auth';
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getSingleCompany,
  updateCompany,
} from '../controllers/companies-controller';
import { checkPageQuery } from '../middlewares/check-page-query';
import { isCompanyExists } from '../middlewares/is-company-exists';
import { verifyCompanyOwnership } from '../middlewares/verify-company-ownership';

const router: Router = express.Router();

router.get('/get-companies', authenticateUser, checkPageQuery, getCompanies);
router.get(
  '/:id/get-single-company',
  isCompanyExists,
  authenticateUser,
  getSingleCompany
);
router.post('/create-company', authenticateUser, createCompany);
router.delete(
  '/:id/delete-company',
  isCompanyExists,
  authenticateUser,
  verifyCompanyOwnership,
  deleteCompany
);
router.patch(
  '/:id/update-company',
  isCompanyExists,
  authenticateUser,
  updateCompany
);

export default router;
