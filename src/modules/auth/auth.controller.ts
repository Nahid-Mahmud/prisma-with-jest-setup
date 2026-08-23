import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Logged in successfully',
    data: result,
  });
});

export const AuthController = {
  login,
};
