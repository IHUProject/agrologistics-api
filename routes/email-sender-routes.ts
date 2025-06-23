import express from 'express'
import { EmailSenderController } from '../presentaition/email-sender-controller'
import { isEntityExists } from '../middlewares/is-entity-exists'
import Expanse from '../models/Expense'
import { checkUnsendItems } from '../middlewares/check-unsend-items'
import Purchase from '../models/Purchase'
import { isSend } from '../middlewares/is-entity-unsend'

const emailSerderController = new EmailSenderController()
const router = express.Router()

router.get(
  '/send-unsend-expenses',
  checkUnsendItems(Expanse),
  emailSerderController.sendUnsendExpenses.bind(emailSerderController)
)
router.get(
  '/send-unsend-purchases',
  checkUnsendItems(Purchase),
  emailSerderController.sendUnsendPurchases.bind(emailSerderController)
)
router.get(
  '/:id/send-single-unsend-expense',
  isEntityExists(Expanse),
  isSend(Expanse),
  emailSerderController.sendSingleExpense.bind(emailSerderController)
)
router.get(
  '/:id/send-single-unsend-purchase',
  isEntityExists(Purchase),
  isSend(Purchase),
  emailSerderController.sendSinglePurchase.bind(emailSerderController)
)

export default router
