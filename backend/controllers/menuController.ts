import crypto from 'crypto';
import type { Request, Response } from 'express';
import { DIET_PLANS, MEAL_CATEGORIES } from '../config/constants.ts';
import { getAllMenus, saveAllMenus } from '../services/jsonStorage.ts';
import type { DietPlan, MealCategory, MenuItemRecord } from '../types/index.ts';

function isValidDietPlan(value: unknown): value is DietPlan {
  return typeof value === 'string' && (DIET_PLANS as readonly string[]).includes(value);
}

function isValidMealCategory(value: unknown): value is MealCategory {
  return (
    typeof value === 'string' &&
    (MEAL_CATEGORIES as readonly string[]).includes(value)
  );
}

export async function getMenusSummary(_req: Request, res: Response): Promise<void> {
  const menus = await getAllMenus();
  const counts: Record<DietPlan, number> = {
    'Weight Loss': 0,
    'Weight Gain': 0,
    'High Protein': 0,
  };
  for (const item of menus) {
    if (isValidDietPlan(item.dietPlan)) {
      counts[item.dietPlan] += 1;
    }
  }
  res.json({ counts, totalItems: menus.length });
}

export async function getMenusByPlan(req: Request, res: Response): Promise<void> {
  const planParam = Array.isArray(req.params.plan)
    ? req.params.plan[0]
    : req.params.plan;
  const plan = decodeURIComponent(planParam || '');
  if (!isValidDietPlan(plan)) {
    res.status(400).json({
      error: 'Invalid diet plan. Must be Weight Loss, Weight Gain, or High Protein.',
    });
    return;
  }

  const menus = await getAllMenus();
  const items = menus.filter((item) => item.dietPlan === plan);

  res.json({
    plan,
    items,
  });
}

export async function createMenuItem(req: Request, res: Response): Promise<void> {
  const dietPlan = req.body?.dietPlan;
  const foodName =
    typeof req.body?.foodName === 'string' ? req.body.foodName.trim() : '';
  const mealCategory = req.body?.mealCategory;
  const description =
    typeof req.body?.description === 'string' ? req.body.description.trim() : '';

  if (!isValidDietPlan(dietPlan)) {
    res.status(400).json({
      error: 'Diet plan must be Weight Loss, Weight Gain, or High Protein.',
    });
    return;
  }
  if (!foodName) {
    res.status(400).json({ error: 'Food name is required.' });
    return;
  }
  if (!isValidMealCategory(mealCategory)) {
    res.status(400).json({
      error:
        'Meal category must be Breakfast, Morning Snack, Lunch, Evening Snack, or Dinner.',
    });
    return;
  }
  if (!description) {
    res.status(400).json({ error: 'Food description is required.' });
    return;
  }

  const menus = await getAllMenus();
  const now = new Date().toISOString();
  const newItem: MenuItemRecord = {
    id: `MENU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    dietPlan,
    foodName,
    mealCategory,
    description,
    createdAt: now,
    updatedAt: now,
  };

  menus.push(newItem);
  await saveAllMenus(menus);

  res.status(201).json({
    message: 'Menu item added successfully.',
    item: newItem,
  });
}

export async function updateMenuItem(req: Request, res: Response): Promise<void> {
  const menus = await getAllMenus();
  const index = menus.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  const existing = menus[index];
  const dietPlan =
    req.body?.dietPlan !== undefined ? req.body.dietPlan : existing.dietPlan;
  const foodName =
    typeof req.body?.foodName === 'string'
      ? req.body.foodName.trim()
      : existing.foodName;
  const mealCategory =
    req.body?.mealCategory !== undefined
      ? req.body.mealCategory
      : existing.mealCategory;
  const description =
    typeof req.body?.description === 'string'
      ? req.body.description.trim()
      : existing.description;

  if (!isValidDietPlan(dietPlan)) {
    res.status(400).json({
      error: 'Diet plan must be Weight Loss, Weight Gain, or High Protein.',
    });
    return;
  }
  if (!foodName) {
    res.status(400).json({ error: 'Food name is required.' });
    return;
  }
  if (!isValidMealCategory(mealCategory)) {
    res.status(400).json({
      error:
        'Meal category must be Breakfast, Morning Snack, Lunch, Evening Snack, or Dinner.',
    });
    return;
  }
  if (!description) {
    res.status(400).json({ error: 'Food description is required.' });
    return;
  }

  const updated: MenuItemRecord = {
    ...existing,
    dietPlan,
    foodName,
    mealCategory,
    description,
    updatedAt: new Date().toISOString(),
  };

  menus[index] = updated;
  await saveAllMenus(menus);

  res.json({
    message: 'Menu item updated successfully.',
    item: updated,
  });
}

export async function deleteMenuItem(req: Request, res: Response): Promise<void> {
  const menus = await getAllMenus();
  const exists = menus.some((item) => item.id === req.params.id);
  if (!exists) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  const remaining = menus.filter((item) => item.id !== req.params.id);
  await saveAllMenus(remaining);

  res.json({ message: 'Menu item deleted successfully.' });
}
