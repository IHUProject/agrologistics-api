import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/auth-middlewares';
import { CompanyController } from '../controllers/companies-controller';
import { Roles } from '../interfaces/enums';
import {
  validateCoordinates,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import {
  isCompanyExists,
  verifyUserCompanyMembership,
} from '../middlewares/company-middlewares';

const companyController = new CompanyController();
const router = express.Router();

router.get(
  '/get-companies',
  validateQueryPage,
  companyController.getCompanies.bind(companyController)
);
router.get(
  '/:companyId/get-single-company',
  isCompanyExists,
  companyController.getSingleCompany.bind(companyController)
);
router.post(
  '/create-company',
  validateCoordinates,
  authenticateUser,
  authorizePermissions(Roles.UNCATEGORIZED),
  companyController.createCompany.bind(companyController)
);
router.delete(
  '/:companyId/delete-company',
  isCompanyExists,
  authenticateUser,
  companyController.deleteCompany.bind(companyController)
);
router.patch(
  '/:companyId/update-company',
  authenticateUser,
  isCompanyExists,
  verifyUserCompanyMembership,
  validateCoordinates,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  companyController.updateCompany.bind(companyController)
);
router.get(
  '/:companyId/get-employees',
  authenticateUser,
  validateQueryPage,
  isCompanyExists,
  companyController.getEmployees.bind(companyController)
);

export default router;
