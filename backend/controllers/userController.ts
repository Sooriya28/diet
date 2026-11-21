import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { DIET_PLANS } from '../config/constants.ts';
import { sanitizeUser } from '../services/authService.ts';
import {
  getAdminRecord,
  getAllUsers,
  saveAllUsers,
} from '../services/jsonStorage.ts';
import type { DietPlan, UserRecord, UserStatus } from '../types/index.ts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidDietPlan(value: unknown): value is DietPlan {
  return typeof value === 'string' && (DIET_PLANS as readonly string[]).includes(value);
}

function generateDietCardId(existingUsers: UserRecord[]): string {
  const year = new Date().getFullYear();
  const existingIds = new Set(existingUsers.map((u) => u.dietCardId));
  let candidate = '';
  do {
    const code = crypto.randomInt(1000, 9999);
    candidate = `DCM-${year}-${code}`;
  } while (existingIds.has(candidate));
  return candidate;
}

function computeStats(users: UserRecord[]) {
  const planCounts: Record<DietPlan, number> = {
    'Weight Loss': 0,
    'Weight Gain': 0,
    'High Protein': 0,
  };

  let activeUsers = 0;
  for (const user of users) {
    if (user.status === 'active') activeUsers += 1;
    if (isValidDietPlan(user.assignedPlan)) {
      planCounts[user.assignedPlan] += 1;
    }
  }

  return {
    totalUsers: users.length,
    activeUsers,
    inactiveUsers: users.length - activeUsers,
    planCounts,
  };
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const allUsers = await getAllUsers();
  const stats = computeStats(allUsers);

  const search =
    typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const planFilter =
    typeof req.query.plan === 'string' ? req.query.plan.trim() : '';
  const statusFilter =
    typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';

  let filtered = allUsers;
  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.phone.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search) ||
        u.dietCardId.toLowerCase().includes(search)
    );
  }
  if (planFilter && planFilter !== 'all') {
    filtered = filtered.filter((u) => u.assignedPlan === planFilter);
  }
  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((u) => u.status === statusFilter);
  }

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({
    users: sorted.map(sanitizeUser),
    stats,
  });
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const users = await getAllUsers();
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const fullName =
    typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';
  const age = Number(req.body?.age);
  const height = Number(req.body?.height);
  const weight = Number(req.body?.weight);
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const address =
    typeof req.body?.address === 'string' ? req.body.address.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const username =
    typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password =
    typeof req.body?.password === 'string' ? req.body.password : '';
  const assignedPlan = req.body?.assignedPlan;

  if (!fullName) {
    res.status(400).json({ error: 'Full name is required.' });
    return;
  }
  if (!Number.isFinite(age) || age <= 0 || age > 120) {
    res.status(400).json({ error: 'Age must be a valid positive number (1–120).' });
    return;
  }
  if (!Number.isFinite(height) || height <= 0 || height > 300) {
    res.status(400).json({ error: 'Height (cm) must be a valid positive number.' });
    return;
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
    res.status(400).json({ error: 'Weight (kg) must be a valid positive number.' });
    return;
  }
  if (!phone || phone.length < 7) {
    res.status(400).json({ error: 'A valid phone number is required.' });
    return;
  }
  if (!address) {
    res.status(400).json({ error: 'Address is required.' });
    return;
  }
  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }
  if (username.length < 3 || /\s/.test(username)) {
    res.status(400).json({
      error: 'Username must be at least 3 characters without spaces.',
    });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }
  if (!isValidDietPlan(assignedPlan)) {
    res.status(400).json({
      error: 'Assigned diet plan must be Weight Loss, Weight Gain, or High Protein.',
    });
    return;
  }

  const users = await getAllUsers();
  const admin = await getAdminRecord();

  if (admin && admin.username.toLowerCase() === username.toLowerCase()) {
    res.status(409).json({ error: 'Username is reserved for the administrator.' });
    return;
  }
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    res.status(409).json({ error: 'Username already exists. Choose another.' });
    return;
  }
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(409).json({ error: 'Email address is already registered.' });
    return;
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: UserRecord = {
    id: `USR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    dietCardId: generateDietCardId(users),
    fullName,
    age: Math.round(age),
    height: Number(height.toFixed(1)),
    weight: Number(weight.toFixed(1)),
    phone,
    address,
    email,
    username,
    passwordHash,
    assignedPlan,
    status: 'active',
    role: 'user',
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  await saveAllUsers(users);

  res.status(201).json({
    message: 'User created successfully.',
    user: sanitizeUser(newUser),
  });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const users = await getAllUsers();
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const existing = users[index];
  const fullName =
    typeof req.body?.fullName === 'string'
      ? req.body.fullName.trim()
      : existing.fullName;
  const age = req.body?.age !== undefined ? Number(req.body.age) : existing.age;
  const height =
    req.body?.height !== undefined ? Number(req.body.height) : existing.height;
  const weight =
    req.body?.weight !== undefined ? Number(req.body.weight) : existing.weight;
  const phone =
    typeof req.body?.phone === 'string' ? req.body.phone.trim() : existing.phone;
  const address =
    typeof req.body?.address === 'string'
      ? req.body.address.trim()
      : existing.address;
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim() : existing.email;
  const username =
    typeof req.body?.username === 'string'
      ? req.body.username.trim()
      : existing.username;
  const password =
    typeof req.body?.password === 'string' ? req.body.password : '';
  const assignedPlan =
    req.body?.assignedPlan !== undefined
      ? req.body.assignedPlan
      : existing.assignedPlan;
  const status: UserStatus =
    req.body?.status === 'active' || req.body?.status === 'inactive'
      ? req.body.status
      : existing.status;

  if (!fullName) {
    res.status(400).json({ error: 'Full name is required.' });
    return;
  }
  if (!Number.isFinite(age) || age <= 0 || age > 120) {
    res.status(400).json({ error: 'Age must be a valid positive number (1–120).' });
    return;
  }
  if (!Number.isFinite(height) || height <= 0 || height > 300) {
    res.status(400).json({ error: 'Height (cm) must be a valid positive number.' });
    return;
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
    res.status(400).json({ error: 'Weight (kg) must be a valid positive number.' });
    return;
  }
  if (!phone || phone.length < 7) {
    res.status(400).json({ error: 'A valid phone number is required.' });
    return;
  }
  if (!address) {
    res.status(400).json({ error: 'Address is required.' });
    return;
  }
  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }
  if (username.length < 3 || /\s/.test(username)) {
    res.status(400).json({
      error: 'Username must be at least 3 characters without spaces.',
    });
    return;
  }
  if (password && password.length < 6) {
    res.status(400).json({
      error: 'New password must be at least 6 characters.',
    });
    return;
  }
  if (!isValidDietPlan(assignedPlan)) {
    res.status(400).json({
      error: 'Assigned diet plan must be Weight Loss, Weight Gain, or High Protein.',
    });
    return;
  }

  const admin = await getAdminRecord();
  if (admin && admin.username.toLowerCase() === username.toLowerCase()) {
    res.status(409).json({ error: 'Username is reserved for the administrator.' });
    return;
  }
  if (
    users.some(
      (u) => u.id !== existing.id && u.username.toLowerCase() === username.toLowerCase()
    )
  ) {
    res.status(409).json({ error: 'Username already exists. Choose another.' });
    return;
  }
  if (
    users.some(
      (u) => u.id !== existing.id && u.email.toLowerCase() === email.toLowerCase()
    )
  ) {
    res.status(409).json({ error: 'Email address is already registered.' });
    return;
  }

  const passwordHash = password
    ? await bcrypt.hash(password, 10)
    : existing.passwordHash;

  const updated: UserRecord = {
    ...existing,
    fullName,
    age: Math.round(age),
    height: Number(height.toFixed(1)),
    weight: Number(weight.toFixed(1)),
    phone,
    address,
    email,
    username,
    passwordHash,
    assignedPlan,
    status,
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;
  await saveAllUsers(users);

  res.json({
    message: 'User updated successfully.',
    user: sanitizeUser(updated),
  });
}

export async function toggleUserStatus(req: Request, res: Response): Promise<void> {
  const users = await getAllUsers();
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const existing = users[index];
  const requestedStatus = req.body?.status;
  const nextStatus: UserStatus =
    requestedStatus === 'active' || requestedStatus === 'inactive'
      ? requestedStatus
      : existing.status === 'active'
        ? 'inactive'
        : 'active';

  users[index] = {
    ...existing,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  await saveAllUsers(users);

  res.json({
    message: `User ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
    user: sanitizeUser(users[index]),
  });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const users = await getAllUsers();
  const exists = users.some((u) => u.id === req.params.id);
  if (!exists) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const remaining = users.filter((u) => u.id !== req.params.id);
  await saveAllUsers(remaining);

  res.json({ message: 'User deleted successfully.' });
}
