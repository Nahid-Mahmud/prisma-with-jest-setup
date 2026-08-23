import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/prisma';
import envVariables from '../../config/env';
import { AppError } from '../../errors/AppError';
import { generateJwtToken } from '../../utils/jwt';
import { comparePassword } from '../../utils/hashPassword';

const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const accessToken = generateJwtToken(
    { id: user.id, email: user.email, role: user.role },
    envVariables.JWT_SECRET,
    envVariables.JWT_EXPIRES_IN
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...rest } = user;

  return { accessToken, user: rest };
};

export const AuthService = {
  login,
};
