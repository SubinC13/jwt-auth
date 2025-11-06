import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  sub: string;
  role: 'admin' | 'customer';
}

export function signJwt(payload: JwtPayload, expiresIn: string = '7d') {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}


