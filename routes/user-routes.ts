import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/auth-middlewares';
import { UserController } from '../controllers/user-controller';
import { validateQueryPage } from '../middlewares/validate-request-properties-middlewares';
import {
  isUserExits,
  verifyAccountOwnership,
} from '../middlewares/user-middlewares';
import { Roles } from '../interfaces/enums';
import {
  isCompanyExists,
  verifyUserCompanyMembership,
} from '../middlewares/company-middlewares';

const userController = new UserController();
const router = express.Router();

router.get(
  '/get-current-user',
  authenticateUser,
  userController.getCurrentUser.bind(userController)
);
router.get(
  '/get-users',
  validateQueryPage,
  userController.getUsers.bind(userController)
);
router.get(
  '/:userId/get-single-user',
  isUserExits,
  userController.getSingleUser.bind(userController)
);
router.delete(
  '/:userId/delete-user',
  authenticateUser,
  verifyAccountOwnership,
  userController.deleteUser.bind(userController)
);
router.patch(
  '/:userId/update-user',
  authenticateUser,
  verifyAccountOwnership,
  userController.updateUser.bind(userController)
);
router.patch(
  '/:userId/change-password',
  authenticateUser,
  verifyAccountOwnership,
  userController.changePassword.bind(userController)
);
router.patch(
  '/:userId/change-role',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isUserExits,
  userController.changeUserRole.bind(userController)
);
router.patch(
  '/:userId/add-user-to-company',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isUserExits,
  isCompanyExists,
  verifyUserCompanyMembership,
  userController.addToCompany.bind(userController)
);
router.patch(
  '/:userId/remove-user-from-company',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isUserExits,
  userController.removeFromCompany.bind(userController)
);

export default router;
