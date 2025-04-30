import express from 'express'
import { authenticateUser, authorizePermissions, isLoggedIn } from '../middlewares/auth-middlewares'
import { UserController } from '../controllers/user-controller'
import {
  hasCompanyOrUserId,
  validateQueryPageAndQueryLimit
} from '../middlewares/validate-request-properties-middlewares'
import {
  hasForbiddenRoleType,
  hasRoleProperty,
  preventSelfModification,
  verifyAccountOwnership
} from '../middlewares/user-middlewares'
import { Roles } from '../interfaces/enums'
import multer, { memoryStorage } from 'multer'
import { isEntityExists } from '../middlewares/is-entity-exists'
import User from '../models/User'
import { hasCreds } from '../middlewares/has-credentials'

const userController = new UserController()
const router = express.Router()

const storage = memoryStorage()
const upload = multer({ storage: storage })

router.post(
  '/create-user',
  authenticateUser,
  upload.single('image'),
  hasForbiddenRoleType,
  hasCompanyOrUserId,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  userController.createUser.bind(userController)
)
router.get(
  '/get-current-user',
  authenticateUser,
  userController.getCurrentUser.bind(userController)
)
router.get(
  '/get-users',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  validateQueryPageAndQueryLimit,
  userController.getUsers.bind(userController)
)
router.get(
  '/:id/get-single-user',
  authenticateUser,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isEntityExists(User),
  userController.getSingleUser.bind(userController)
)
router.delete(
  '/:id/delete-user',
  authenticateUser,
  verifyAccountOwnership,
  userController.deleteUser.bind(userController)
)
router.patch(
  '/:id/update-user',
  authenticateUser,
  upload.single('image'),
  hasCompanyOrUserId,
  hasRoleProperty,
  verifyAccountOwnership,
  userController.updateUser.bind(userController)
)
router.patch(
  '/:id/change-password',
  authenticateUser,
  verifyAccountOwnership,
  userController.changePassword.bind(userController)
)
router.patch(
  '/:id/change-role',
  authenticateUser,
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  hasForbiddenRoleType,
  preventSelfModification,
  isEntityExists(User),
  userController.changeUserRole.bind(userController)
)
router.patch(
  '/:id/add-user',
  authenticateUser,
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  hasForbiddenRoleType,
  preventSelfModification,
  isEntityExists(User),
  userController.addToCompany.bind(userController)
)
router.patch(
  '/:id/remove-user',
  authenticateUser,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  preventSelfModification,
  isEntityExists(User),
  userController.removeFromCompany.bind(userController)
)
router.patch(
  '/forgot-password',
  hasCreds,
  isLoggedIn,
  userController.forgotPassword.bind(userController)
)

export default router
