import type { DIET_PLANS, MEAL_CATEGORIES } from '../config/constants.ts';

export type DietPlan = (typeof DIET_PLANS)[number];
export type MealCategory = (typeof MEAL_CATEGORIES)[number];
export type UserStatus = 'active' | 'inactive';
export type UserRole = 'admin' | 'user';

export interface AdminRecord {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin';
  source: 'env' | 'setup';
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  dietCardId: string;
  fullName: string;
  age: number;
  height: number;
  weight: number;
  phone: string;
  address: string;
  email: string;
  username: string;
  passwordHash: string;
  assignedPlan: DietPlan;
  status: UserStatus;
  role: 'user';
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export interface MenuItemRecord {
  id: string;
  dietPlan: DietPlan;
  foodName: string;
  mealCategory: MealCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  sub: string;
  role: UserRole;
  username: string;
  jti: string;
  exp?: number;
}
