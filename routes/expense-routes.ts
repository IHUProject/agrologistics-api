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
import { isExpenseExists } from '../middlewares/expense-middlewares';

const expenseController = new ExpenseController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/create-expense',
  isSupplierExists,
  isCategoryExists,
  hasCompanyOrUserId,
  upload.array('files'),
  expenseController.createExpense.bind(expenseController)
);
router.get(
  '/:expenseId/get-category',
  isExpenseExists,
  expenseController.getSingleExpense.bind(expenseController)
);
router.get(
  '/get-expenses',
  validateQueryLimit,
  validateQueryPage,
  expenseController.getExpenses.bind(expenseController)
);
router.delete(
  '/:expensesId/delete-expense',
  isExpenseExists,
  expenseController.deleteCategory.bind(expenseController)
);
router.patch(
  '/:expensesId/update-expense',
  isExpenseExists,
  hasCompanyOrUserId,
  isSupplierExists,
  isCategoryExists,
  expenseController.updateExpense.bind(expenseController)
);

export default router;
