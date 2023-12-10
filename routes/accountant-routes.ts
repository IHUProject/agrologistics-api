import express, { Router } from 'express';
import { AccountantController } from '../controllers/accountants-controller';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { verifyUserCompanyMembership } from '../middlewares/company-middlewares';
import { isAccountantExists } from '../middlewares/accountant-middlewares';
import { validateCoordinates } from '../middlewares/validate-request-properties-middlewares';

const router: Router = express.Router();
const accountantController = new AccountantController();

router.post(
  '/create-accountant',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  validateCoordinates,
  accountantController.createAccountant.bind(accountantController)
);
router.delete(
  '/:accId/delete-accountant',
  authenticateUser,
  isAccountantExists,
  verifyUserCompanyMembership,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  accountantController.deleteAccountant.bind(accountantController)
);
router.get(
  '/get-accountant',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY, Roles.EMPLOY),
  accountantController.getSingleAccountant.bind(accountantController)
);
router.patch(
  '/:accId/update-accountant',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY, Roles.EMPLOY),
  isAccountantExists,
  validateCoordinates,
  verifyUserCompanyMembership,
  accountantController.updateAccountant.bind(accountantController)
);

export default router;
