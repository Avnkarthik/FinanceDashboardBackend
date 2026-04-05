import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../model/UserModel';

export interface JwtPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const ProtectRoute = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    let token = req.cookies?.token;

    // Fallback for manual cookie parsing like the previous project if cookie-parser fails to inject
    if (!token && req.headers.cookie) {
      token = req.headers.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const AuthorizeRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();
  };
};
