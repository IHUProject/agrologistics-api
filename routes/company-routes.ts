import express, { Router } from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/auth-middlewares';
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getSingleCompany,
  updateCompany,
} from '../controllers/companies-controller';
import { Roles } from '../interfaces/enums';
import {
  checkCoordinates,
  checkPageQuery,
} from '../middlewares/validate-request-properties-middlewares';
import {
  isCompanyExists,
  isUserBelongsToCompany,
} from '../middlewares/company-middlewares';

const router: Router = express.Router();

router.get('/get-companies', checkPageQuery, authenticateUser, getCompanies);
router.get(
  '/:companyId/get-single-company',
  isCompanyExists,
  authenticateUser,
  getSingleCompany
);
router.post(
  '/create-company',
  checkCoordinates,
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
  isUserBelongsToCompany,
  checkCoordinates,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  updateCompany
);

export default router;
