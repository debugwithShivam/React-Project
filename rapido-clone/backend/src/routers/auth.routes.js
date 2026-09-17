import { Router } from 'express';
import {
  Authcontroller,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/register', Authcontroller);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/refreshToken', refreshToken);
authRouter.post('/logout', logout);

export default authRouter;