import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { Roles } from '../interfaces/enums';
import { SupplierController } from '../controllers/supplier-controller';
import {
  hasCompanyOrUserId,
  hasExpenses,
  validateQueryLimit,
  validateQueryPage,
} from '../middlewares/validate-request-properties-middlewares';
import { isEntityExists } from '../middlewares/is-entity-exists';
import Supplier from '../models/Supplier';

const supplierController = new SupplierController();
const router = express.Router();

router.post(
  '/create-supplier',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  hasCompanyOrUserId,
  hasExpenses,
  supplierController.createSupplier.bind(supplierController)
);
router.get(
  '/:supplierId/get-supplier',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isEntityExists(Supplier),
  supplierController.getSingleSupplier.bind(supplierController)
);
router.get(
  '/get-suppliers',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  validateQueryLimit,
  validateQueryPage,
  supplierController.getSuppliers.bind(supplierController)
);
router.delete(
  '/:supplierId/delete-supplier',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  isEntityExists(Supplier),
  supplierController.deleteSupplier.bind(supplierController)
);
router.patch(
  '/:supplierId/update-supplier',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  isEntityExists(Supplier),
  hasCompanyOrUserId,
  hasExpenses,
  supplierController.updateSupplier.bind(supplierController)
);

export default router;
