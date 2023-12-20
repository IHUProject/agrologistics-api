import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { CompanyController } from '../controllers/company-controller';
import { Roles } from '../interfaces/enums';
import { isCompanyExists } from '../middlewares/company-middlewares';
import multer, { memoryStorage } from 'multer';
import {
  isUserExits,
  preventSelfModification,
} from '../middlewares/user-middlewares';
import { validateCoordinates } from '../middlewares/validate-request-properties-middlewares';

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
  authorizePermissions(Roles.UNCATEGORIZED),
  upload.single('logo'),
  validateCoordinates,
  companyController.createCompany.bind(companyController)
);
router.delete(
  '/:companyId/delete-company',
  authorizePermissions(Roles.OWNER),
  isCompanyExists,
  companyController.deleteCompany.bind(companyController)
);
router.patch(
  '/:companyId/update-company',
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  isCompanyExists,
  upload.single('logo'),
  validateCoordinates,
  companyController.updateCompany.bind(companyController)
);
router.patch(
  '/:userId/add-user',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  preventSelfModification,
  isUserExits,
  companyController.addToCompany.bind(companyController)
);
router.patch(
  '/:userId/remove-user',
  authorizePermissions(Roles.OWNER, Roles.SENIOR_EMPLOY),
  preventSelfModification,
  isUserExits,
  companyController.removeFromCompany.bind(companyController)
);

export default router;
