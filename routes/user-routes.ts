import express, { Router } from 'express';
import { authenticateUser } from '../middlewares/auth';
import {
  deleteUser,
  getCurrentUser,
  getSingleUser,
  getUsers,
  updateUser,
} from '../controllers/user-controller';
import { isUserExits } from '../middlewares/is-user-exists';
import { isOwnerOfTheAccount } from '../middlewares/is-owner-account';

const router: Router = express.Router();

router.get('/get-current-user', authenticateUser, getCurrentUser);
router.get('/get-users', authenticateUser, getUsers);
router.get(
  '/:id/get-single-user',
  authenticateUser,
  isUserExits,
  getSingleUser
);
router.delete(
  '/:id/delete-user',
  authenticateUser,
  isOwnerOfTheAccount,
  isUserExits,
  deleteUser
);
router.patch(
  '/:id/update-user',
  authenticateUser,
  isOwnerOfTheAccount,
  isUserExits,
  updateUser
);

export default router;
