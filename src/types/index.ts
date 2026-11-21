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

export type DietPlan = (typeof DIET_PLANS)[number];
export type MealCategory = (typeof MEAL_CATEGORIES)[number];
export type UserStatus = 'active' | 'inactive';
export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  role: UserRole;
  username: string;
  fullName: string;
  dietCardId?: string;
  age?: number;
  height?: number;
  weight?: number;
  phone?: string;
  address?: string;
  email?: string;
  assignedPlan?: DietPlan;
  status?: UserStatus;
  createdAt?: string;
}

export interface MemberUser {
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
  assignedPlan: DietPlan;
  status: UserStatus;
  role: 'user';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  planCounts: Record<DietPlan, number>;
}

export interface MenuItem {
  id: string;
  dietPlan: DietPlan;
  foodName: string;
  mealCategory: MealCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DietCardData {
  appName: string;
  fullName: string;
  dietCardId: string;
  age: number;
  height: number;
  weight: number;
  assignedPlan: DietPlan;
  phone: string;
  status: UserStatus;
  issuedAt: string;
}

export interface MemberMenuResponse {
  assignedPlan: DietPlan;
  planDescription: string;
  items: MenuItem[];
  categories: Array<{
    category: MealCategory;
    items: MenuItem[];
  }>;
}
