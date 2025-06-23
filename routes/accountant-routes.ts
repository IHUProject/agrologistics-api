import express, { Router } from 'express'
import { AccountantController } from '../presentaition/accountant-controller'
import { authorizePermissions } from '../middlewares/auth-middlewares'
import { Roles } from '../interfaces/enums'
import {
  hasCompanyOrUserId,
  validateCoordinates
} from '../middlewares/validate-request-properties-middlewares'
import multer, { memoryStorage } from 'multer'
import { isEntityExists } from '../middlewares/is-entity-exists'
import Accountant from '../models/Accountant'

const router: Router = express.Router()
const accountantController = new AccountantController()

const storage = memoryStorage()
const upload = multer({ storage: storage })

router.post(
  '/create-accountant',
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  validateCoordinates,
  hasCompanyOrUserId,
  accountantController.createAccountant.bind(accountantController)
)
router.delete(
  '/:id/delete-accountant',
  isEntityExists(Accountant),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  accountantController.deleteAccountant.bind(accountantController)
)
router.get(
  '/get-accountant',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY, Roles.EMPLOY),
  accountantController.getSingleAccountant.bind(accountantController)
)
router.patch(
  '/:id/update-accountant',
  upload.none(),
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY, Roles.EMPLOY),
  isEntityExists(Accountant),
  validateCoordinates,
  hasCompanyOrUserId,
  accountantController.updateAccountant.bind(accountantController)
)

export default router
