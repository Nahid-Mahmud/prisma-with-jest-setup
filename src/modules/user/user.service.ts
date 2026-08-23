import type { Prisma } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { hashPassword } from '../../utils/hashPassword';

// Create a new user
const createUser = async (data: Prisma.UserCreateInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email already exists');
  }

  const hashedPassword = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
    omit: { password: true },
  });
  return user;
};

// Get all users with optional filtering
const getAllUsers = async (query?: Prisma.UserWhereInput) => {
  const users = await prisma.user.findMany({
    ...(query && { where: query }),
    include: {
      posts: true,
    },
    omit: { password: true },
  });
  return users;
};

// Get a single user by ID
const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: true,
    },
    omit: { password: true },
  });
  return user;
};

// Get a user by email
const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      posts: true,
    },
    omit: { password: true },
  });
  return user;
};

// Update a user
const updateUser = async (id: number, data: Prisma.UserUpdateInput) => {
  const user = await prisma.user.update({
    where: { id },
    data,
    omit: { password: true },
  });
  return user;
};

// Delete a user
const deleteUser = async (id: number) => {
  const user = await prisma.user.delete({
    where: { id },
    omit: { password: true },
  });
  return user;
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
};
