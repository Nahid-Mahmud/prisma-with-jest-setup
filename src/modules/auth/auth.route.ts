import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { loginSchema } from './auth.validation';

export const authRouter: Router = Router();

authRouter.post(
  '/login',
  validateRequest({ body: loginSchema }),
  AuthController.login
);
