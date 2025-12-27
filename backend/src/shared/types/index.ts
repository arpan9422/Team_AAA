import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export interface JWTPayload {
  userId: string;
  role: string;
}
