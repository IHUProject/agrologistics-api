import express from 'express';
import { PurchaseController } from '../controllers/purchase-controller';
import { isClientExists } from '../middlewares/client-middlewares';
import { isProductExists } from '../middlewares/product-middlewares';
import {
  hasCompanyOrUserId,
  hasSendProperty,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import multer, { memoryStorage } from 'multer';
import { isEntityExists } from '../middlewares/is-entity-exists';
import Purchase from '../models/Purchase';

const purchaseController = new PurchaseController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/create-purchase',
  upload.none(),
  isClientExists(false),
  isProductExists,
  hasCompanyOrUserId,
  hasSendProperty,
  purchaseController.createPurchase.bind(purchaseController)
);
router.get(
  '/:id/get-purchase',
  isEntityExists(Purchase),
  purchaseController.getSinglePurchase.bind(purchaseController)
);
router.get(
  '/get-purchases',
  validateQueryPage,
  validateQueryLimit,
  purchaseController.getPurchases.bind(purchaseController)
);
router.delete(
  '/:id/delete-purchase',
  isEntityExists(Purchase),
  purchaseController.deletePurchase.bind(purchaseController)
);
router.patch(
  '/:id/update-purchase',
  upload.none(),
  isEntityExists(Purchase),
  isClientExists(true),
  isProductExists,
  hasCompanyOrUserId,
  hasSendProperty,
  purchaseController.updatePurchase.bind(purchaseController)
);

export default router;
