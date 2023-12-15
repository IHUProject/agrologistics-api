import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/auth-middlewares';
import { UserController } from '../controllers/user-controller';
import { validateQueryPage } from '../middlewares/validate-request-properties-middlewares';
import {
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
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  userController.createUser.bind(userController)
);
router.get(
  '/get-current-user',
  authenticateUser,
  userController.getCurrentUser.bind(userController)
);
router.get(
  '/get-users',
  validateQueryPage,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
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
  verifyAccountOwnership,
  upload.single('image'),
  userController.updateUser.bind(userController)
);
router.patch(
  '/:userId/change-password',
  verifyAccountOwnership,
  userController.changePassword.bind(userController)
);
router.patch(
  '/:userId/change-role',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  preventSelfModification,
  isUserExits,
  userController.changeUserRole.bind(userController)
);

export default router;
