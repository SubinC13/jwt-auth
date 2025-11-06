import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { signJwt } from '../utils/jwt';
import { StatusCodes } from 'http-status-codes';

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'customer';
  };
  const exists = await UserModel.findOne({ email }).lean();
  if (exists) {
    return res.status(StatusCodes.CONFLICT).json({ error: 'Email already in use' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, role: role || 'customer', passwordHash });
  const token = signJwt({ sub: user.id, role: user.role });
  return res.status(StatusCodes.CREATED).json({ token, user: { id: user.id, name, email, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
  }
  const token = signJwt({ sub: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}


