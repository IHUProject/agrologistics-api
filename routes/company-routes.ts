import express, { Router } from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/auth-middlewares';
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getEmployees,
  getSingleCompany,
  updateCompany,
} from '../controllers/companies-controller';
import { Roles } from '../interfaces/enums';
import {
  validateCoordinates,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import {
  isCompanyExists,
  verifyUserCompanyMembership,
} from '../middlewares/company-middlewares';

const router: Router = express.Router();

router.get('/get-companies', validateQueryPage, getCompanies);
router.get('/:companyId/get-single-company', isCompanyExists, getSingleCompany);
router.post(
  '/create-company',
  validateCoordinates,
  authenticateUser,
  authorizePermissions(Roles.UNCATEGORIZED),
  createCompany
);
router.delete(
  '/:companyId/delete-company',
  isCompanyExists,
  authenticateUser,
  deleteCompany
);
router.patch(
  '/:companyId/update-company',
  authenticateUser,
  isCompanyExists,
  verifyUserCompanyMembership,
  validateCoordinates,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  updateCompany
);
router.get(
  '/:companyId/get-employees',
  authenticateUser,
  validateQueryPage,
  isCompanyExists,
  getEmployees
);

export default router;
