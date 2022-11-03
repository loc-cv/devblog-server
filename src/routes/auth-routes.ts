import express from 'express';
import {
  login,
  logout,
  refresh,
  register,
} from '../controllers/auth-controller';
import { validate } from '../middlewares/validate';
import { loginFormSchema, registerFormSchema } from '../schemas/user-schema';

const router = express.Router();

router.post('/register', validate(registerFormSchema), register);
router.post('/login', validate(loginFormSchema), login);
router.post('/logout', logout);
router.get('/refresh', refresh);

export default router;
