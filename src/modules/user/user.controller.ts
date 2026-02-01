import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import type { Prisma } from '@prisma/client';

// Create a new user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User created successfully',
    data: user,
  });
});

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query: Prisma.UserWhereInput = {};
  if (req.query.id) query.id = Number(req.query.id);
  if (req.query.email)
    query.email = { contains: req.query.email as string, mode: 'insensitive' };
  if (req.query.name)
    query.name = { contains: req.query.name as string, mode: 'insensitive' };

  const users = await UserService.getAllUsers(query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users retrieved successfully',
    data: users,
  });
});

// Get a single user by ID
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await UserService.getUserById(id);

  if (!user) {
    sendResponse(res, {
      success: false,
      statusCode: 404,
      message: 'User not found',
      data: null,
    });
    return;
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User retrieved successfully',
    data: user,
  });
});

// Update a user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await UserService.updateUser(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User updated successfully',
    data: user,
  });
});

// Delete a user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await UserService.deleteUser(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User deleted successfully',
    data: user,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
