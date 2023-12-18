import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { ClientController } from '../controllers/client-controller';
import { isClientExists } from '../middlewares/client-middlewares';
import { validateQueryPage } from '../middlewares/validate-request-properties-middlewares';

const clientController = new ClientController();
const router = express.Router();

router.post(
  '/create-client',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  clientController.createClient.bind(clientController)
);
router.get(
  '/:clientId/get-client',
  isClientExists,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  clientController.getSingleClient.bind(clientController)
);
router.get(
  '/get-clients',
  validateQueryPage,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  clientController.getClients.bind(clientController)
);
router.delete(
  '/:clientId/delete-client',
  isClientExists,
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  clientController.deleteClient.bind(clientController)
);
router.patch(
  '/:clientId/update-client',
  isClientExists,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  clientController.updateClient.bind(clientController)
);

export default router;
