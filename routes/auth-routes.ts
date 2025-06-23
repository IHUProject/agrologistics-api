import express, { Router } from 'express'
import { AuthController } from '../presentaition/auth-controller'
import { isLoggedIn, isNotLoggedIn } from '../middlewares/auth-middlewares'
import multer, { memoryStorage } from 'multer'
import { hasRoleProperty } from '../middlewares/user-middlewares'
import { hasCompanyOrUserId } from '../middlewares/validate-request-properties-middlewares'

const router: Router = express.Router()
const authController = new AuthController()

const storage = memoryStorage()
const upload = multer({ storage: storage })

router.post(
  '/register',
  upload.single('image'),
  hasRoleProperty,
  hasCompanyOrUserId,
  isLoggedIn,
  authController.register.bind(authController)
)
router.post(
  '/login',
  upload.none(),
  isLoggedIn,
  authController.login.bind(authController)
)
router.get(
  '/logout',
  isNotLoggedIn,
  authController.logout.bind(authController)
)

export default router
