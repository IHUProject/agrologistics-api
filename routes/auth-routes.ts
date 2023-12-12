import express, { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth-middlewares';
import multer, { memoryStorage } from 'multer';

const router: Router = express.Router();
const authController = new AuthController();

const storage = memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/register',
  isLoggedIn,
  upload.single('image'),
  authController.register.bind(authController)
);
router.post('/login', isLoggedIn, authController.login.bind(authController));
router.get(
  '/logout',
  isNotLoggedIn,
  authController.logout.bind(authController)
);

export default router;
