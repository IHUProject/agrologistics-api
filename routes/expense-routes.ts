import express from 'express';
import { ExpenseController } from '../controllers/expense-controller';
import {
  hasCompanyOrUserId,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import multer, { memoryStorage } from 'multer';
import {
  isEntityExists,
  isEntityExistsIdOnPayload,
} from '../middlewares/is-entity-exists';
import Expanse from '../models/Expense';
import Supplier from '../models/Supplier';
import Category from '../models/Category';

const expenseController = new ExpenseController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/create-expense',
  upload.array('images'),
  isEntityExistsIdOnPayload(Supplier, 'supplier'),
  isEntityExistsIdOnPayload(Category, 'category'),
  hasCompanyOrUserId,
  expenseController.createExpense.bind(expenseController)
);
router.get(
  '/:id/get-expense',
  isEntityExists(Expanse),
  expenseController.getSingleExpense.bind(expenseController)
);
router.get(
  '/get-expenses',
  validateQueryLimit,
  validateQueryPage,
  expenseController.getExpenses.bind(expenseController)
);
router.delete(
  '/:id/delete-expense',
  isEntityExists(Expanse),
  expenseController.deleteCategory.bind(expenseController)
);
router.patch(
  '/:id/update-expense',
  isEntityExists(Expanse),
  hasCompanyOrUserId,
  isEntityExistsIdOnPayload(Supplier, 'supplier', true),
  isEntityExistsIdOnPayload(Category, 'category', true),
  expenseController.updateExpense.bind(expenseController)
);
router.delete(
  '/:id/delete-image',
  isEntityExists(Expanse),
  expenseController.deleteImage.bind(expenseController)
);
router.patch(
  '/:id/upload-images',
  upload.array('images'),
  isEntityExists(Expanse),
  expenseController.uploadImages.bind(expenseController)
);

export default router;
