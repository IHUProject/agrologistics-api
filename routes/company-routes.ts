import express, { Router } from 'express';
import { authenticateUser, authorizePermissions } from '../middlewares/auth';
import {
  addEmploy,
  createCompany,
  deleteCompany,
  getCompanies,
  getSingleCompany,
  removeEmploy,
  updateCompany,
} from '../controllers/companies-controller';
import { checkPageQuery } from '../middlewares/check-page-query';
import { isCompanyExists } from '../middlewares/is-company-exists';
import { verifyCompanyOwnership } from '../middlewares/verify-company-ownership';
import { Roles } from '../interfaces/enums';
import { isUserExits } from '../middlewares/is-user-exists';
import { isWorking } from '../middlewares/is-working';
import { validateRoleProperty } from '../middlewares/validate-role-property';
import { isCurrentUserValid } from '../middlewares/is-current-user-valid';
import { isEmploy } from '../middlewares/is-employ';

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
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  updateCompany
);
router.post(
  '/:id/add-employ',
  authenticateUser,
  isCompanyExists,
  isCurrentUserValid,
  isUserExits,
  isWorking,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  validateRoleProperty,
  addEmploy
);
router.post(
  '/:id/remove-employ',
  authenticateUser,
  isCompanyExists,
  isCurrentUserValid,
  isUserExits,
  isEmploy,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  removeEmploy
);

export default router;
