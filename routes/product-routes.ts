import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { ProductController } from '../controllers/products-controller';
import { isProductExists } from '../middlewares/product-middlewares';
import { validateQueryPage } from '../middlewares/validate-request-properties-middlewares';

const productController = new ProductController();
const router = express.Router();

router.post(
  '/create-product',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
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
  validateQueryPage,
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
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
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  isProductExists,
  productController.updateProduct.bind(productController)
);

export default router;
