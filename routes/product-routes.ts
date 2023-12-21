import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { ProductController } from '../controllers/product-controller';
import { isProductExists } from '../middlewares/product-middlewares';
import {
  hasCompanyOrUserId,
  hasPurchasesProperty,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import multer, { memoryStorage } from 'multer';

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
  '/:productId/get-product',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isProductExists,
  productController.getSingleProduct.bind(productController)
);
router.get(
  '/get-products',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  validateQueryPage,
  productController.getProducts.bind(productController)
);
router.delete(
  '/:productId/delete-product',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isProductExists,
  productController.deleteProduct.bind(productController)
);
router.patch(
  '/:productId/update-product',
  upload.none(),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  hasPurchasesProperty,
  hasCompanyOrUserId,
  isProductExists,
  productController.updateProduct.bind(productController)
);

export default router;
