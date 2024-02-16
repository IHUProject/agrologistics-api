import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { CompanyController } from '../controllers/company-controller';
import { Roles } from '../interfaces/enums';
import multer, { memoryStorage } from 'multer';
import {
  hasExistingCompanyRelations,
  validateCoordinates,
} from '../middlewares/validate-request-properties-middlewares';
import { isEntityExists } from '../middlewares/is-entity-exists';
import Company from '../models/Company';

const companyController = new CompanyController();
const router = express.Router();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.get(
  '/get-company',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER, Roles.EMPLOY),
  companyController.getCompany.bind(companyController)
);
router.post(
  '/create-company',
  upload.single('logo'),
  authorizePermissions(Roles.UNCATEGORIZED),
  hasExistingCompanyRelations,
  validateCoordinates,
  companyController.createCompany.bind(companyController)
);
router.delete(
  '/:id/delete-company',
  authorizePermissions(Roles.OWNER),
  isEntityExists(Company),
  companyController.deleteCompany.bind(companyController)
);
router.patch(
  '/:id/update-company',
  upload.single('logo'),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  hasExistingCompanyRelations,
  isEntityExists(Company),
  validateCoordinates,
  companyController.updateCompany.bind(companyController)
);

export default router;
