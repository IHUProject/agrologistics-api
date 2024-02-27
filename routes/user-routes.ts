import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { UserController } from '../controllers/user-controller';
import {
  hasCompanyOrUserId,
  validateQueryPageAndQueryLimit,
} from '../middlewares/validate-request-properties-middlewares';
import {
  hasForbiddenRoleType,
  hasRoleProperty,
  preventSelfModification,
  verifyAccountOwnership,
} from '../middlewares/user-middlewares';
import { Roles } from '../interfaces/enums';
import multer, { memoryStorage } from 'multer';
import { isEntityExists } from '../middlewares/is-entity-exists';
import User from '../models/User';

const userController = new UserController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/create-user',
  upload.single('image'),
  hasForbiddenRoleType,
  hasCompanyOrUserId,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  userController.createUser.bind(userController)
);
router.get(
  '/get-current-user',
  userController.getCurrentUser.bind(userController)
);
router.get(
  '/get-users',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  validateQueryPageAndQueryLimit,
  userController.getUsers.bind(userController)
);
router.get(
  '/:id/get-single-user',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isEntityExists(User),
  userController.getSingleUser.bind(userController)
);
router.delete(
  '/:id/delete-user',
  verifyAccountOwnership,
  userController.deleteUser.bind(userController)
);
router.patch(
  '/:id/update-user',
  upload.single('image'),
  hasCompanyOrUserId,
  hasRoleProperty,
  verifyAccountOwnership,
  userController.updateUser.bind(userController)
);
router.patch(
  '/:id/change-password',
  verifyAccountOwnership,
  userController.changePassword.bind(userController)
);
router.patch(
  '/:id/change-role',
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  hasForbiddenRoleType,
  preventSelfModification,
  isEntityExists(User),
  userController.changeUserRole.bind(userController)
);
router.patch(
  '/:id/add-user',
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  hasForbiddenRoleType,
  preventSelfModification,
  isEntityExists(User),
  userController.addToCompany.bind(userController)
);
router.patch(
  '/:id/remove-user',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  preventSelfModification,
  isEntityExists(User),
  userController.removeFromCompany.bind(userController)
);

export default router;
