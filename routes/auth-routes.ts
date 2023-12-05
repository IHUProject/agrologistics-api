import express, { Router } from 'express';
import { login, logout, register } from '../controllers/auth-controller';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth-middlewares';
import {
  validatePassword,
  validateUserPayload,
} from '../middlewares/validate-request-properties-middlewares';

const router: Router = express.Router();

router.post(
  '/register',
  isLoggedIn,
  validateUserPayload,
  validatePassword,
  register
);
router.post('/login', isLoggedIn, login);
router.get('/logout', isNotLoggedIn, logout);

export default router;
