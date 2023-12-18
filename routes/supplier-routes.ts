import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { SupplierController } from '../controllers/suppliers-controller';

const supplierController = new SupplierController();
const router = express.Router();

router.post(
  '/create-supplier',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  supplierController.createSupplier.bind(supplierController)
);
router.get(
  '/:supplierId/get-supplier',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  supplierController.getSingleSupplier.bind(supplierController)
);
router.get(
  '/get-suppliers',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  supplierController.getSuppliers.bind(supplierController)
);
router.delete(
  '/:supplierId/delete-supplier',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  supplierController.deleteSupplier.bind(supplierController)
);
router.patch(
  '/:supplierId/update-supplierId',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  supplierController.updateSupplier.bind(supplierController)
);

export default router;