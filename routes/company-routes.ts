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
import { Roles } from '../interfaces/enums';
import { isUserExits } from '../middlewares/is-user-exists';
import { isCurrentUserOnCompany } from '../middlewares/is-current-user-on-company';
import { checkRoleIfIsOwner } from '../middlewares/check-role-if-is-owner';
import { checkCoordinates } from '../middlewares/check-coordinates';

const router: Router = express.Router();

router.get('/get-companies', authenticateUser, checkPageQuery, getCompanies);
router.get(
  '/:id/get-single-company',
  isCompanyExists,
  authenticateUser,
  getSingleCompany
);
router.post(
  '/create-company',
  authenticateUser,
  authorizePermissions(Roles.UNCATEGORIZED),
  checkCoordinates,
  createCompany
);
router.delete(
  '/:id/delete-company',
  authenticateUser,
  isCompanyExists,
  deleteCompany
);
router.patch(
  '/:id/update-company',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  isCompanyExists,
  checkCoordinates,
  updateCompany
);
router.post(
  '/:id/add-employ',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  isCurrentUserOnCompany,
  isCompanyExists,
  isUserExits,
  checkRoleIfIsOwner,
  addEmploy
);
router.post(
  '/:id/remove-employ',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  isCompanyExists,
  isCurrentUserOnCompany,
  isUserExits,

  removeEmploy
);

export default router;
