import express from 'express';
import { ExpenseController } from '../controllers/expense-controller';
import {
  hasCompanyOrUserId,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import multer, { memoryStorage } from 'multer';
import { isSupplierExists } from '../middlewares/supplier-middlewares';
import { isCategoryExists } from '../middlewares/category-middlewares';
import { isEntityExists } from '../middlewares/is-entity-exists';
import Expanse from '../models/Expense';

const expenseController = new ExpenseController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/create-expense',
  upload.array('images'),
  isSupplierExists,
  isCategoryExists,
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
  isSupplierExists,
  isCategoryExists,
  expenseController.updateExpense.bind(expenseController)
);

export default router;
