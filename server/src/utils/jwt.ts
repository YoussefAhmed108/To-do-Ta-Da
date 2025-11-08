import * as jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  username: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
  );
};
