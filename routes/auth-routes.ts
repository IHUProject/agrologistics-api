import express, { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth-middlewares';

const router: Router = express.Router();
const authController = new AuthController();

router.post(
  '/register',
  isLoggedIn,
  authController.register.bind(authController)
);
router.post('/login', isLoggedIn, authController.login.bind(authController));
router.get(
  '/logout',
  isNotLoggedIn,
  authController.logout.bind(authController)
);

export default router;
