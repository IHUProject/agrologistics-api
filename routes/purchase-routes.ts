import express from 'express';
import { PurchaseController } from '../controllers/purchase-controller';
import { isClientExists } from '../middlewares/client-middlewares';
import { isProductExists } from '../middlewares/product-middlewares';
import { validateQueryPage } from '../middlewares/validate-request-properties-middlewares';
import { isPurchaseExists } from '../middlewares/purchase-middlewares';

const purchaseController = new PurchaseController();
const router = express.Router();

router.post(
  '/create-purchase',
  isClientExists(false),
  isProductExists,
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
  purchaseController.getPurchases.bind(purchaseController)
);
router.delete(
  '/:purchaseId/delete-purchase',
  isPurchaseExists,
  purchaseController.deletePurchase.bind(purchaseController)
);
router.patch(
  '/:purchaseId/update-purchase',
  isPurchaseExists,
  isClientExists(true),
  isProductExists,
  purchaseController.updatePurchase.bind(purchaseController)
);

export default router;
