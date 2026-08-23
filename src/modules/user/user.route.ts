import { Router } from 'express';
import { UserController } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { createUserSchema, updateUserSchema } from './user.validation';

export const userRouter: Router = Router();

// Create a new user
userRouter.post(
  '/',
  validateRequest({ body: createUserSchema }),
  UserController.createUser
);

// Get all users (with optional query parameters)
userRouter.get('/', UserController.getAllUsers);

// Get a single user by ID
userRouter.get('/:id', UserController.getUserById);

// Update a user
userRouter.patch(
  '/:id',
  validateRequest({ body: updateUserSchema }),
  UserController.updateUser
);

// Delete a user
userRouter.delete('/:id', UserController.deleteUser);
