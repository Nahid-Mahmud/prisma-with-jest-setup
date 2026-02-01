import type { Prisma, User } from '@prisma/client';
import { prisma } from '../../config/prisma';

// Create a new user
const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  const user = await prisma.user.create({
    data,
  });
  return user;
};

// Get all users with optional filtering
const getAllUsers = async (query?: Prisma.UserWhereInput): Promise<User[]> => {
  const users = await prisma.user.findMany({
    ...(query && { where: query }),
    include: {
      posts: true,
    },
  });
  return users;
};

// Get a single user by ID
const getUserById = async (id: number): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: true,
    },
  });
  return user;
};

// Get a user by email
const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      posts: true,
    },
  });
  return user;
};

// Update a user
const updateUser = async (
  id: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
};

// Delete a user
const deleteUser = async (id: number): Promise<User> => {
  const user = await prisma.user.delete({
    where: { id },
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
