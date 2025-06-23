import express from 'express'
import { authorizePermissions } from '../middlewares/auth-middlewares'
import { Roles } from '../../types/enums'
import { ClientController } from '../controllers/client-controller'
import {
  hasCompanyOrUserId,
  hasPurchasesProperty,
  validateQueryPageAndQueryLimit
} from '../middlewares/validate-request-properties-middlewares'
import multer, { memoryStorage } from 'multer'
import Client from '../../data-access/models/Client'
import { isEntityExists } from '../middlewares/is-entity-exists'

const clientController = new ClientController()
const router = express.Router()

const storage = memoryStorage()
const upload = multer({ storage: storage })

router.post(
  '/create-client',
  upload.none(),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  hasPurchasesProperty,
  hasCompanyOrUserId,
  clientController.createClient.bind(clientController)
)
router.get(
  '/:id/get-client',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isEntityExists(Client),
  clientController.getSingleClient.bind(clientController)
)
router.get(
  '/get-clients',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  validateQueryPageAndQueryLimit,
  clientController.getClients.bind(clientController)
)
router.delete(
  '/:id/delete-client',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isEntityExists(Client),
  clientController.deleteClient.bind(clientController)
)
router.patch(
  '/:id/update-client',
  upload.none(),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  hasPurchasesProperty,
  isEntityExists(Client),
  hasCompanyOrUserId,
  clientController.updateClient.bind(clientController)
)

export default router
