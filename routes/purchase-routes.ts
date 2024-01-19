import express from 'express';
import { PurchaseController } from '../controllers/purchase-controller';
import { isClientExists } from '../middlewares/client-middlewares';
import { isProductExists } from '../middlewares/product-middlewares';
import {
  hasCompanyOrUserId,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import { isPurchaseExists } from '../middlewares/purchase-middlewares';
import multer, { memoryStorage } from 'multer';

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
  purchaseController.createPurchase.bind(purchaseController)
);
router.get(
  '/:purchaseId/get-purchase',
  isPurchaseExists,
  purchaseController.getSinglePurchase.bind(purchaseController)
);
router.get(
  '/get-purchases',
  validateQueryPage,
  validateQueryLimit,
  purchaseController.getPurchases.bind(purchaseController)
);
router.delete(
  '/:purchaseId/delete-purchase',
  isPurchaseExists,
  purchaseController.deletePurchase.bind(purchaseController)
);
router.patch(
  '/:purchaseId/update-purchase',
  upload.none(),
  isPurchaseExists,
  isClientExists(true),
  isProductExists,
  hasCompanyOrUserId,
  purchaseController.updatePurchase.bind(purchaseController)
);

export default router;
