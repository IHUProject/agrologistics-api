import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { ProductController } from '../controllers/product-controller';
import {
  hasCompanyOrUserId,
  hasPurchasesProperty,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import multer, { memoryStorage } from 'multer';
import { isEntityExists } from '../middlewares/is-entity-exists';
import Product from '../models/Product';

const productController = new ProductController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/create-product',
  upload.none(),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  hasPurchasesProperty,
  hasCompanyOrUserId,
  productController.createProduct.bind(productController)
);
router.get(
  '/:id/get-product',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isEntityExists(Product),
  productController.getSingleProduct.bind(productController)
);
router.get(
  '/get-products',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  validateQueryPage,
  validateQueryLimit,
  productController.getProducts.bind(productController)
);
router.delete(
  '/:id/delete-product',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isEntityExists(Product),
  productController.deleteProduct.bind(productController)
);
router.patch(
  '/:id/update-product',
  upload.none(),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  hasPurchasesProperty,
  hasCompanyOrUserId,
  isEntityExists(Product),
  productController.updateProduct.bind(productController)
);

export default router;
