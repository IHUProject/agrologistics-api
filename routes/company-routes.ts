import express from 'express';
import { authorizePermissions } from '../middlewares/auth-middlewares';
import { CompanyController } from '../controllers/companies-controller';
import { Roles } from '../interfaces/enums';
import { validateCoordinates } from '../middlewares/validate-request-properties-middlewares';
import { isCompanyExists } from '../middlewares/company-middlewares';
import multer, { memoryStorage } from 'multer';

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
  validateCoordinates,
  upload.single('logo'),
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
  isCompanyExists,
  validateCoordinates,
  upload.single('logo'),
  authorizePermissions(Roles.SENIOR_EMPLOY, Roles.OWNER),
  companyController.updateCompany.bind(companyController)
);

export default router;
