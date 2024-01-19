import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { UserController } from '../controllers/user-controller';
import {
  hasCompanyOrUserId,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import {
  hasForbiddenRoleType,
  hasRoleProperty,
  isUserExits,
  preventSelfModification,
  verifyAccountOwnership,
} from '../middlewares/user-middlewares';
import { Roles } from '../interfaces/enums';
import multer, { memoryStorage } from 'multer';

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
  validateQueryPage,
  validateQueryLimit,
  userController.getUsers.bind(userController)
);
router.get(
  '/:userId/get-single-user',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isUserExits,
  userController.getSingleUser.bind(userController)
);
router.delete(
  '/:userId/delete-user',
  verifyAccountOwnership,
  userController.deleteUser.bind(userController)
);
router.patch(
  '/:userId/update-user',
  upload.single('image'),
  hasCompanyOrUserId,
  hasRoleProperty,
  verifyAccountOwnership,
  userController.updateUser.bind(userController)
);
router.patch(
  '/:userId/change-password',
  verifyAccountOwnership,
  userController.changePassword.bind(userController)
);
router.patch(
  '/:userId/change-role',
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  hasForbiddenRoleType,
  preventSelfModification,
  hasForbiddenRoleType,
  isUserExits,
  userController.changeUserRole.bind(userController)
);
router.patch(
  '/:userId/add-user',
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  hasForbiddenRoleType,
  preventSelfModification,
  isUserExits,
  userController.addToCompany.bind(userController)
);
router.patch(
  '/:userId/remove-user',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  preventSelfModification,
  isUserExits,
  userController.removeFromCompany.bind(userController)
);

export default router;
