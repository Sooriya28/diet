import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import {
  revokeAuthToken,
  sanitizeUser,
  signAuthToken,
} from '../services/authService.ts';
import {
  getAdminRecord,
  getAllUsers,
  saveAdminRecord,
} from '../services/jsonStorage.ts';

export async function getAuthStatus(_req: Request, res: Response): Promise<void> {
  const admin = await getAdminRecord();
  res.json({
    adminConfigured: Boolean(admin && admin.username && admin.passwordHash),
  });
}

export async function setupAdmin(req: Request, res: Response): Promise<void> {
  const envConfigured = Boolean(
    process.env.ADMIN_USERNAME?.trim() && process.env.ADMIN_PASSWORD?.trim()
  );
  if (envConfigured) {
    res.status(403).json({
      error: 'Admin account is already configured via environment variables.',
    });
    return;
  }

  const existing = await getAdminRecord();
  if (existing && existing.username && existing.passwordHash) {
    res.status(403).json({
      error: 'Admin account has already been initialized.',
    });
    return;
  }

  const username =
    typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password =
    typeof req.body?.password === 'string' ? req.body.password : '';

  if (username.length < 3 || username.length > 40 || /\s/.test(username)) {
    res.status(400).json({
      error: 'Admin username must be 3–40 characters with no spaces.',
    });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({
      error: 'Admin password must be at least 6 characters.',
    });
    return;
  }

  const users = await getAllUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    res.status(409).json({
      error: 'Username conflicts with an existing member account.',
    });
    return;
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 10);
  await saveAdminRecord({
    id: 'ADMIN-0001',
    username,
    passwordHash,
    role: 'admin',
    source: 'setup',
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json({
    message: 'Admin account configured successfully. You can now sign in.',
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const username =
    typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password =
    typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  // 1. Check Admin credentials
  const admin = await getAdminRecord();
  if (admin && admin.username.toLowerCase() === username.toLowerCase()) {
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const token = signAuthToken({
      sub: admin.id,
      role: 'admin',
      username: admin.username,
    });

    res.json({
      token,
      user: {
        id: admin.id,
        role: 'admin',
        username: admin.username,
        fullName: 'Administrator',
      },
    });
    return;
  }

  // 2. Check Member User credentials
  const users = await getAllUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  if (user.status !== 'active') {
    res.status(403).json({
      error: 'Your account is currently inactive. Please contact the administrator.',
    });
    return;
  }

  const token = signAuthToken({
    sub: user.id,
    role: 'user',
    username: user.username,
  });

  res.json({
    token,
    user: sanitizeUser(user),
  });
}

export function logout(req: Request, res: Response): void {
  if (req.auth?.jti) {
    revokeAuthToken(req.auth.jti, req.auth.exp);
  }
  res.json({ message: 'Logged out successfully.' });
}

export function getMe(req: Request, res: Response): void {
  if (!req.auth) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  if (req.auth.role === 'admin') {
    res.json({
      user: {
        id: req.auth.id,
        role: 'admin',
        username: req.auth.username,
        fullName: 'Administrator',
      },
    });
    return;
  }

  if (req.auth.userRecord) {
    res.json({
      user: sanitizeUser(req.auth.userRecord),
    });
    return;
  }

  res.status(401).json({ error: 'Session user not found.' });
}
