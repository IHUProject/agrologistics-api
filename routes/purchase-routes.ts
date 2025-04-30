import express from 'express'
import { PurchaseController } from '../controllers/purchase-controller'
import {
  areProductsExists,
  hasCompanyOrUserId,
  hasSendProperty,
  validateQueryPageAndQueryLimit
} from '../middlewares/validate-request-properties-middlewares'
import multer, { memoryStorage } from 'multer'
import { isEntityExists, isEntityExistsIdOnPayload } from '../middlewares/is-entity-exists'
import Purchase from '../models/Purchase'
import Client from '../models/Client'

const purchaseController = new PurchaseController()
const router = express.Router()

const storage = memoryStorage()
const upload = multer({ storage: storage })

router.post(
  '/create-purchase',
  upload.none(),
  isEntityExistsIdOnPayload(Client, 'client', true),
  areProductsExists,
  hasCompanyOrUserId,
  hasSendProperty,
  purchaseController.createPurchase.bind(purchaseController)
)
router.get(
  '/:id/get-purchase',
  isEntityExists(Purchase),
  purchaseController.getSinglePurchase.bind(purchaseController)
)
router.get(
  '/get-purchases',
  validateQueryPageAndQueryLimit,
  purchaseController.getPurchases.bind(purchaseController)
)
router.delete(
  '/:id/delete-purchase',
  isEntityExists(Purchase),
  purchaseController.deletePurchase.bind(purchaseController)
)
router.patch(
  '/:id/update-purchase',
  upload.none(),
  isEntityExists(Purchase),
  isEntityExistsIdOnPayload(Client, 'client', true),
  areProductsExists,
  hasCompanyOrUserId,
  hasSendProperty,
  purchaseController.updatePurchase.bind(purchaseController)
)

export default router
