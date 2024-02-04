import express from 'express';
import {
  hasCompanyOrUserId,
  hasExpenses,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import { CategoryController } from '../controllers/category-controller';
import { isCategoryExists } from '../middlewares/category-middlewares';

const categoryController = new CategoryController();
const router = express.Router();

router.post(
  '/create-category',
  hasCompanyOrUserId,
  hasExpenses,
  categoryController.createCategory.bind(categoryController)
);
router.get(
  '/:categoryId/get-category',
  isCategoryExists,
  categoryController.getSingleCategory.bind(categoryController)
);
router.get(
  '/get-categories',
  validateQueryLimit,
  validateQueryPage,
  categoryController.getCategories.bind(categoryController)
);
router.delete(
  '/:categoryId/delete-category',
  isCategoryExists,
  categoryController.deleteCategory.bind(categoryController)
);
router.patch(
  '/:categoryId/update-category',
  isCategoryExists,
  hasCompanyOrUserId,
  hasExpenses,
  categoryController.updateCategory.bind(categoryController)
);

export default router;
