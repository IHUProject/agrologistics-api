import express, { Router } from 'express';
import { AccountantController } from '../controllers/accountant-controller';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { isAccountantExists } from '../middlewares/accountant-middlewares';
import { validateCoordinates } from '../middlewares/validate-request-properties-middlewares';

const router: Router = express.Router();
const accountantController = new AccountantController();

router.post(
  '/create-accountant',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  validateCoordinates,
  accountantController.createAccountant.bind(accountantController)
);
router.delete(
  '/:accId/delete-accountant',
  isAccountantExists,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  accountantController.deleteAccountant.bind(accountantController)
);
router.get(
  '/get-accountant',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY, Roles.EMPLOY),
  accountantController.getSingleAccountant.bind(accountantController)
);
router.patch(
  '/:accId/update-accountant',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY, Roles.EMPLOY),
  isAccountantExists,
  validateCoordinates,
  accountantController.updateAccountant.bind(accountantController)
);

export default router;
