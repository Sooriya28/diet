import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  MEAL_CATEGORIES,
  type DietPlan,
  type MealCategory,
  type MenuItem,
} from '../types/index.ts';

export interface MenuItemPayload {
  dietPlan: DietPlan;
  foodName: string;
  mealCategory: MealCategory;
  description: string;
}

interface MenuItemModalProps {
  open: boolean;
  selectedPlan: DietPlan;
  editingItem: MenuItem | null;
  busy: boolean;
  serverError: string;
  onClose: () => void;
  onSubmit: (payload: MenuItemPayload) => Promise<void>;
}

export function MenuItemModal({
  open,
  selectedPlan,
  editingItem,
  busy,
  serverError,
  onClose,
  onSubmit,
}: MenuItemModalProps) {
  const [foodName, setFoodName] = useState('');
  const [mealCategory, setMealCategory] = useState<MealCategory>('Breakfast');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!open) return;
    setValidationError('');
    if (editingItem) {
      setFoodName(editingItem.foodName);
      setMealCategory(editingItem.mealCategory);
      setDescription(editingItem.description);
    } else {
      setFoodName('');
      setMealCategory('Breakfast');
      setDescription('');
    }
  }, [open, editingItem]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError('');

    if (!foodName.trim()) {
      setValidationError('Food name is required.');
      return;
    }
    if (!description.trim()) {
      setValidationError('Description is required.');
      return;
    }

    await onSubmit({
      dietPlan: editingItem ? editingItem.dietPlan : selectedPlan,
      foodName: foodName.trim(),
      mealCategory,
      description: description.trim(),
    });
  }

  const displayedError = validationError || serverError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="menu-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {editingItem ? 'Edit Food Item' : 'Add Food Item'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Diet Plan: {editingItem ? editingItem.dietPlan : selectedPlan}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {displayedError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {displayedError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Meal Category <span className="text-red-600">*</span>
            </label>
            <select
              value={mealCategory}
              onChange={(e) => setMealCategory(e.target.value as MealCategory)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
            >
              {MEAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Food Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Oats and Fruits"
              required
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Portion notes, preparation style, and ingredients..."
              required
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="whitespace-nowrap rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy
                ? 'Saving...'
                : editingItem
                  ? 'Save Changes'
                  : 'Add Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
