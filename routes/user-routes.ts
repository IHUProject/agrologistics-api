import express, { Router } from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/auth-middlewares';
import {
  changePassword,
  changeUserRole,
  deleteUser,
  getCurrentUser,
  getSingleUser,
  getUsers,
  updateUser,
} from '../controllers/user-controller';
import {
  checkPageQuery,
  checkRoleIfIsOwner,
} from '../middlewares/validate-request-properties-middlewares';
import {
  isUserExits,
  verifyAccountOwnership,
} from '../middlewares/user-middlewares';
import { Roles } from '../interfaces/enums';

const router: Router = express.Router();

router.get('/get-current-user', authenticateUser, getCurrentUser);
router.get('/get-users', checkPageQuery, authenticateUser, getUsers);
router.get(
  '/:userId/get-single-user',
  isUserExits,
  authenticateUser,
  getSingleUser
);
router.delete(
  '/:userId/delete-user',
  authenticateUser,
  verifyAccountOwnership,
  deleteUser
);
router.patch(
  '/:userId/update-user',
  authenticateUser,
  verifyAccountOwnership,
  updateUser
);
router.patch(
  '/:userId/change-password',
  authenticateUser,
  verifyAccountOwnership,
  changePassword
);
router.patch(
  '/:userId/change-role',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  checkRoleIfIsOwner,
  isUserExits,
  changeUserRole
);

export default router;
