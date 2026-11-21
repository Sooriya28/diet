import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../services/authService.ts';
import { getAdminRecord, getAllUsers } from '../services/jsonStorage.ts';
import type { UserRecord, UserRole } from '../types/index.ts';

export interface AuthenticatedContext {
  id: string;
  role: UserRole;
  username: string;
  jti: string;
  exp?: number;
  userRecord?: UserRecord;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedContext;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: 'Authentication token is missing.' });
      return;
    }

    const decoded = verifyAuthToken(token);

    if (decoded.role === 'admin') {
      const admin = await getAdminRecord();
      if (!admin || admin.id !== decoded.sub || admin.username !== decoded.username) {
        res.status(401).json({ error: 'Admin session is no longer valid.' });
        return;
      }
      req.auth = {
        id: admin.id,
        role: 'admin',
        username: admin.username,
        jti: decoded.jti,
        exp: decoded.exp,
      };
      next();
      return;
    }

    if (decoded.role === 'user') {
      const users = await getAllUsers();
      const user = users.find((u) => u.id === decoded.sub);
      if (!user) {
        res.status(401).json({ error: 'User account not found. Please log in again.' });
        return;
      }
      if (user.status !== 'active') {
        res.status(403).json({
          error: 'Your account is currently inactive. Please contact the administrator.',
        });
        return;
      }
      req.auth = {
        id: user.id,
        role: 'user',
        username: user.username,
        jti: decoded.jti,
        exp: decoded.exp,
        userRecord: user,
      };
      next();
      return;
    }

    res.status(401).json({ error: 'Invalid user role.' });
  } catch {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.auth) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.auth.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.auth) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.auth.role !== 'user' || !req.auth.userRecord) {
    res.status(403).json({ error: 'Access denied. Member account required.' });
    return;
  }
  next();
}
