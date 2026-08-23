import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

export const generateJwtToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string
): string => jwt.sign(payload, secret, { expiresIn } as SignOptions);

export const verifyJwtToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired. Please log in again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token.');
    }
    throw error;
  }
};
