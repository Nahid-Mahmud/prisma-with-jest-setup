import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '@prisma/client';
import envVariables from '../config/env';
import { AppError } from '../errors/AppError';
import { verifyJwtToken } from '../utils/jwt';
import { prisma } from '../config/prisma';

export const checkAuth =
  (...allowedRoles: UserRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Access token is required'
        );
      }
      const accessToken = authHeader.split(' ')[1];

      let verifiedToken: ReturnType<typeof verifyJwtToken>;
      try {
        verifiedToken = verifyJwtToken(accessToken, envVariables.JWT_SECRET);
      } catch (error) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          error instanceof Error ? error.message : 'Invalid token'
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: Number(verifiedToken.id) },
      });

      if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User does not exist');
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          'You do not have permission to access this resource'
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
