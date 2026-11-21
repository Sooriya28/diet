import type { Request, Response } from 'express';
import { MEAL_CATEGORIES, PLAN_DESCRIPTIONS } from '../config/constants.ts';
import { sanitizeUser } from '../services/authService.ts';
import { getAllMenus } from '../services/jsonStorage.ts';

export function getMemberProfile(req: Request, res: Response): void {
  const user = req.auth?.userRecord;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  res.json({ profile: sanitizeUser(user) });
}

export function getMemberDietCard(req: Request, res: Response): void {
  const user = req.auth?.userRecord;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  res.json({
    dietCard: {
      appName: 'Diet Card Management System',
      fullName: user.fullName,
      dietCardId: user.dietCardId,
      age: user.age,
      height: user.height,
      weight: user.weight,
      assignedPlan: user.assignedPlan,
      phone: user.phone,
      status: user.status,
      issuedAt: user.createdAt,
    },
  });
}

export async function getMemberMenu(req: Request, res: Response): Promise<void> {
  const user = req.auth?.userRecord;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  // Enforce strict backend access rule: deny attempts to query a different plan via URL/query params
  const requestedPlan =
    typeof req.query.plan === 'string' ? req.query.plan.trim() : '';
  if (requestedPlan && requestedPlan !== user.assignedPlan) {
    res.status(403).json({
      error: `Access denied. Your account is assigned to ${user.assignedPlan}; you cannot access other diet plan menus.`,
    });
    return;
  }

  const allMenus = await getAllMenus();
  const assignedItems = allMenus.filter(
    (item) => item.dietPlan === user.assignedPlan
  );

  const groupedByCategory = MEAL_CATEGORIES.map((category) => ({
    category,
    items: assignedItems.filter((item) => item.mealCategory === category),
  }));

  res.json({
    assignedPlan: user.assignedPlan,
    planDescription: PLAN_DESCRIPTIONS[user.assignedPlan] || '',
    items: assignedItems,
    categories: groupedByCategory,
  });
}
