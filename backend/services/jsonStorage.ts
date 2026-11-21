import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  ADMIN_FILE,
  DATA_DIR,
  MENUS_FILE,
  USERS_FILE,
} from '../config/constants.ts';
import type {
  AdminRecord,
  MenuItemRecord,
  UserRecord,
} from '../types/index.ts';

const writeQueues = new Map<string, Promise<unknown>>();

function assertConfinedPath(targetPath: string): string {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid storage path outside data directory.');
  }
  return resolved;
}

function enqueueWrite<T>(filePath: string, task: () => Promise<T>): Promise<T> {
  const safePath = assertConfinedPath(filePath);
  const previous = writeQueues.get(safePath) ?? Promise.resolve();
  const next = previous.then(task, task);
  writeQueues.set(
    safePath,
    next.catch(() => undefined)
  );
  return next;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  const safePath = assertConfinedPath(filePath);
  try {
    const raw = await fs.readFile(safePath, 'utf-8');
    if (!raw.trim()) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code === 'ENOENT') {
      return fallback;
    }
    if (err instanceof SyntaxError) {
      throw new Error(`Malformed JSON detected in storage file: ${path.basename(safePath)}`);
    }
    throw new Error(`Failed to read storage file: ${path.basename(safePath)}`);
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const safePath = assertConfinedPath(filePath);
  await enqueueWrite(safePath, async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempFile = path.resolve(
      DATA_DIR,
      `.${path.basename(safePath)}.${crypto.randomBytes(6).toString('hex')}.tmp`
    );
    const serialized = JSON.stringify(data, null, 2) + '\n';
    await fs.writeFile(tempFile, serialized, 'utf-8');
    await fs.rename(tempFile, safePath);
  });
}

function buildStarterMenus(): MenuItemRecord[] {
  const now = new Date().toISOString();
  const items: Array<Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>> = [
    // Weight Loss
    {
      dietPlan: 'Weight Loss',
      mealCategory: 'Breakfast',
      foodName: 'Oats and Fruits',
      description: 'Rolled oats cooked in water or skim milk topped with fresh berries and chia seeds.',
    },
    {
      dietPlan: 'Weight Loss',
      mealCategory: 'Morning Snack',
      foodName: 'Apple',
      description: 'One medium crisp apple sliced with a pinch of cinnamon.',
    },
    {
      dietPlan: 'Weight Loss',
      mealCategory: 'Lunch',
      foodName: 'Brown Rice and Vegetables',
      description: 'Steamed brown rice served with lightly sautéed seasonal green vegetables.',
    },
    {
      dietPlan: 'Weight Loss',
      mealCategory: 'Evening Snack',
      foodName: 'Green Tea',
      description: 'Warm unsweetened brewed green tea with a squeeze of fresh lemon.',
    },
    {
      dietPlan: 'Weight Loss',
      mealCategory: 'Dinner',
      foodName: 'Vegetable Soup',
      description: 'Clear homemade broth with carrots, celery, spinach, and cracked black pepper.',
    },
    // Weight Gain
    {
      dietPlan: 'Weight Gain',
      mealCategory: 'Breakfast',
      foodName: 'Banana and Peanut Butter',
      description: 'Whole-wheat toast layered with natural peanut butter and sliced ripe banana.',
    },
    {
      dietPlan: 'Weight Gain',
      mealCategory: 'Morning Snack',
      foodName: 'Mixed Nuts',
      description: 'A generous handful of almonds, cashews, walnuts, and dried raisins.',
    },
    {
      dietPlan: 'Weight Gain',
      mealCategory: 'Lunch',
      foodName: 'Rice and Chicken',
      description: 'Steamed basmati rice paired with seasoned roasted chicken breast and gravy.',
    },
    {
      dietPlan: 'Weight Gain',
      mealCategory: 'Evening Snack',
      foodName: 'Milkshake',
      description: 'Chilled whole-milk banana and date shake blended with oats.',
    },
    {
      dietPlan: 'Weight Gain',
      mealCategory: 'Dinner',
      foodName: 'Paneer and Chapati',
      description: 'Soft whole-wheat chapatis served with rich home-style paneer curry.',
    },
    // High Protein
    {
      dietPlan: 'High Protein',
      mealCategory: 'Breakfast',
      foodName: 'Eggs and Greek Yogurt',
      description: 'Three boiled or scrambled egg whites with plain high-protein Greek yogurt.',
    },
    {
      dietPlan: 'High Protein',
      mealCategory: 'Morning Snack',
      foodName: 'Roasted Chickpeas',
      description: 'Crunchy oven-roasted chickpeas lightly tossed in olive oil and spices.',
    },
    {
      dietPlan: 'High Protein',
      mealCategory: 'Lunch',
      foodName: 'Grilled Chicken and Rice',
      description: 'Herb-marinated grilled chicken breast with steamed rice and cucumber salad.',
    },
    {
      dietPlan: 'High Protein',
      mealCategory: 'Evening Snack',
      foodName: 'Protein-rich Nuts',
      description: 'Roasted almonds, pumpkin seeds, and unsalted pistachios.',
    },
    {
      dietPlan: 'High Protein',
      mealCategory: 'Dinner',
      foodName: 'Paneer and Lentils',
      description: 'Grilled cottage cheese cubes served alongside slow-simmered yellow lentils.',
    },
  ];

  return items.map((item, idx) => ({
    ...item,
    id: `MENU-${String(idx + 1).padStart(4, '0')}`,
    createdAt: now,
    updatedAt: now,
  }));
}

export async function initializeStorage(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  // 1. Initialize users.json only if missing (preserve existing user data across restarts)
  if (!(await fileExists(USERS_FILE))) {
    await writeJsonFile<UserRecord[]>(USERS_FILE, []);
  } else {
    await readJsonFile<UserRecord[]>(USERS_FILE, []);
  }

  // 2. Initialize menus.json with starter items ONLY if missing or empty
  if (!(await fileExists(MENUS_FILE))) {
    await writeJsonFile<MenuItemRecord[]>(MENUS_FILE, buildStarterMenus());
  } else {
    const existingMenus = await readJsonFile<MenuItemRecord[]>(MENUS_FILE, []);
    if (Array.isArray(existingMenus) && existingMenus.length === 0) {
      await writeJsonFile<MenuItemRecord[]>(MENUS_FILE, buildStarterMenus());
    }
  }

  // 3. Initialize admin.json from environment variables if configured
  const envUsername = process.env.ADMIN_USERNAME?.trim() || '';
  const envPassword = process.env.ADMIN_PASSWORD?.trim() || '';

  if (!(await fileExists(ADMIN_FILE))) {
    await writeJsonFile<AdminRecord | null>(ADMIN_FILE, null);
  }

  if (envUsername && envPassword) {
    const existingAdmin = await readJsonFile<AdminRecord | null>(ADMIN_FILE, null);
    const sameUsername = existingAdmin?.username === envUsername;
    const samePassword =
      sameUsername && existingAdmin?.passwordHash
        ? await bcrypt.compare(envPassword, existingAdmin.passwordHash)
        : false;

    if (!sameUsername || !samePassword || existingAdmin?.source !== 'env') {
      const now = new Date().toISOString();
      const passwordHash = await bcrypt.hash(envPassword, 10);
      await writeJsonFile<AdminRecord>(ADMIN_FILE, {
        id: existingAdmin?.id || 'ADMIN-0001',
        username: envUsername,
        passwordHash,
        role: 'admin',
        source: 'env',
        createdAt: existingAdmin?.createdAt || now,
        updatedAt: now,
      });
    }
  }
}

export async function getAdminRecord(): Promise<AdminRecord | null> {
  return readJsonFile<AdminRecord | null>(ADMIN_FILE, null);
}

export async function saveAdminRecord(admin: AdminRecord): Promise<void> {
  await writeJsonFile<AdminRecord>(ADMIN_FILE, admin);
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const data = await readJsonFile<UserRecord[]>(USERS_FILE, []);
  return Array.isArray(data) ? data : [];
}

export async function saveAllUsers(users: UserRecord[]): Promise<void> {
  await writeJsonFile<UserRecord[]>(USERS_FILE, users);
}

export async function getAllMenus(): Promise<MenuItemRecord[]> {
  const data = await readJsonFile<MenuItemRecord[]>(MENUS_FILE, []);
  return Array.isArray(data) ? data : [];
}

export async function saveAllMenus(menus: MenuItemRecord[]): Promise<void> {
  await writeJsonFile<MenuItemRecord[]>(MENUS_FILE, menus);
}
