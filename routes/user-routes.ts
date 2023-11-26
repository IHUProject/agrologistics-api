import express, { Router } from 'express';
import { authenticateUser } from '../middlewares/auth';
import { getCurrentUser } from '../controllers/user-controller';

const router: Router = express.Router();

router.get('/get-current-user', authenticateUser, getCurrentUser);
// router.post('/login', isLoggedIn, login);
// router.get('/logout', isNotLoggedIn, logout);

export default router;
