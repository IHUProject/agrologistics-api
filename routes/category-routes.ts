import express from 'express';
import {
  hasCompanyOrUserId,
  hasExpenses,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import { CategoryController } from '../controllers/category-controller';
import Category from '../models/Category';
import { isEntityExists } from '../middlewares/is-entity-exists';

const categoryController = new CategoryController();
const router = express.Router();

router.post(
  '/create-category',
  hasCompanyOrUserId,
  hasExpenses,
  categoryController.createCategory.bind(categoryController)
);
router.get(
  '/:id/get-category',
  isEntityExists(Category),
  categoryController.getSingleCategory.bind(categoryController)
);
router.get(
  '/get-categories',
  validateQueryLimit,
  validateQueryPage,
  categoryController.getCategories.bind(categoryController)
);
router.delete(
  '/:id/delete-category',
  isEntityExists(Category),
  categoryController.deleteCategory.bind(categoryController)
);
router.patch(
  '/:id/update-category',
  isEntityExists(Category),
  hasCompanyOrUserId,
  hasExpenses,
  categoryController.updateCategory.bind(categoryController)
);

export default router;
