import express, { Router } from 'express';
import { authenticateUser, authorizePermissions } from '../middlewares/auth';
import {
  changePassword,
  changeUserRole,
  deleteUser,
  getCurrentUser,
  getSingleUser,
  getUsers,
  updateUser,
} from '../controllers/user-controller';
import { isUserExits } from '../middlewares/is-user-exists';
import { verifyAccountOwnership } from '../middlewares/verify-account-ownership';
import { checkPageQuery } from '../middlewares/check-page-query';
import { Roles } from '../interfaces/enums';
import { isEmployOnSameCompany } from '../middlewares/is-employ-on-same-company';

const router: Router = express.Router();

router.get('/get-current-user', authenticateUser, getCurrentUser);
router.get('/get-users', checkPageQuery, authenticateUser, getUsers);
router.get(
  '/:id/get-single-user',
  authenticateUser,
  isUserExits,
  getSingleUser
);
router.delete(
  '/:id/delete-user',
  authenticateUser,
  verifyAccountOwnership,
  isUserExits,
  deleteUser
);
router.patch(
  '/:id/update-user',
  authenticateUser,
  verifyAccountOwnership,
  isUserExits,
  updateUser
);
router.patch(
  '/:id/change-password',
  authenticateUser,
  verifyAccountOwnership,
  isUserExits,
  changePassword
);
router.patch(
  '/:id/change-role',
  authenticateUser,
  isUserExits,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isEmployOnSameCompany,
  changeUserRole
);

export default router;
