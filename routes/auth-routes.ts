import express, { Router } from 'express';
import { login, logout, register } from '../controllers/auth-controller';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth-middlewares';

const router: Router = express.Router();

router.post('/register', isLoggedIn, register);
router.post('/login', isLoggedIn, login);
router.get('/logout', isNotLoggedIn, logout);

export default router;
