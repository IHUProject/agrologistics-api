import express from 'express';
import { CredsController } from '../controllers/credentail-controller';
import { hasCompanyOrUserId } from '../middlewares/validate-request-properties-middlewares';
import { isEntityExists } from '../middlewares/is-entity-exists';
import Credential from '../models/Credential';

const credController = new CredsController();
const router = express.Router();

router.get('/get-credentials', credController.getCreds.bind(credController));
router.post(
  '/create-credentials',
  hasCompanyOrUserId,
  credController.createCreds.bind(credController)
);
router.delete(
  '/:id/delete-credentials',
  isEntityExists(Credential),
  credController.deleteCreds.bind(credController)
);
router.patch(
  '/:id/update-credentials',
  isEntityExists(Credential),
  hasCompanyOrUserId,
  credController.updateCreds.bind(credController)
);

export default router;
