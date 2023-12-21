import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { ClientController } from '../controllers/client-controller';
import { isClientExists } from '../middlewares/client-middlewares';
import {
  hasCompanyOrUserId,
  hasPurchasesProperty,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import multer, { memoryStorage } from 'multer';

const clientController = new ClientController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/create-client',
  upload.none(),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  hasPurchasesProperty,
  hasCompanyOrUserId,
  clientController.createClient.bind(clientController)
);
router.get(
  '/:clientId/get-client',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isClientExists(false),
  clientController.getSingleClient.bind(clientController)
);
router.get(
  '/get-clients',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  validateQueryPage,
  clientController.getClients.bind(clientController)
);
router.delete(
  '/:clientId/delete-client',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isClientExists(false),
  clientController.deleteClient.bind(clientController)
);
router.patch(
  '/:clientId/update-client',
  upload.none(),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  hasPurchasesProperty,
  isClientExists(false),
  hasCompanyOrUserId,
  clientController.updateClient.bind(clientController)
);

export default router;
