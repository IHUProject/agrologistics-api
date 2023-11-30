import express, { Router } from 'express';
import { authenticateUser } from '../middlewares/auth';
import {
  createCompany,
  getCompanies,
} from '../controllers/companies-controller';
import { checkPageQuery } from '../middlewares/check-page-query';

const router: Router = express.Router();

router.get('/get-companies', authenticateUser, checkPageQuery, getCompanies);
router.post('/create-company', authenticateUser, createCompany);

export default router;
