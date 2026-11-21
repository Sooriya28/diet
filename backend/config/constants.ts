import path from 'path';

export const DIET_PLANS = [
  'Weight Loss',
  'Weight Gain',
  'High Protein',
] as const;

export const MEAL_CATEGORIES = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Evening Snack',
  'Dinner',
] as const;

export const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data');
export const ADMIN_FILE = path.resolve(DATA_DIR, 'admin.json');
export const USERS_FILE = path.resolve(DATA_DIR, 'users.json');
export const MENUS_FILE = path.resolve(DATA_DIR, 'menus.json');

export const PLAN_DESCRIPTIONS: Record<string, string> = {
  'Weight Loss':
    'Calorie-controlled daily meals emphasizing whole grains, lean plant fiber, and light evening portions.',
  'Weight Gain':
    'Nutrient-dense meals rich in healthy fats, complex carbohydrates, and wholesome energy sources.',
  'High Protein':
    'Protein-forward meal schedule focused on lean meats, dairy, legumes, and recovery snacks.',
};
