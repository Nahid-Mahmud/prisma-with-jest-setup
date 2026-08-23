import bcrypt from 'bcryptjs';
import envVariables from '../config/env';

export const hashPassword = async (plainPassword: string): Promise<string> =>
  bcrypt.hash(plainPassword, Number(envVariables.BCRYPT_SALT_ROUNDS));

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => bcrypt.compare(plainPassword, hashedPassword);
