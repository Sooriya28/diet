import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit2, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog.tsx';
import {
  MenuItemModal,
  type MenuItemPayload,
} from '../../components/MenuItemModal.tsx';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import {
  DIET_PLANS,
  MEAL_CATEGORIES,
  type DietPlan,
  type MenuItem,
} from '../../types/index.ts';

function isValidPlan(value: string | null): value is DietPlan {
  return value !== null && (DIET_PLANS as readonly string[]).includes(value);
}

export function MenuManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPlan = isValidPlan(searchParams.get('plan'))
    ? (searchParams.get('plan') as DietPlan)
    : 'Weight Loss';

  const [selectedPlan, setSelectedPlan] = useState<DietPlan>(initialPlan);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchMenus = useCallback(async (plan: DietPlan) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ plan: DietPlan; items: MenuItem[] }>(
        `/menus/${encodeURIComponent(plan)}`
      );
      setItems(res.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load menu items.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus(selectedPlan);
  }, [selectedPlan, fetchMenus]);

  function handleSelectPlan(plan: DietPlan) {
    setSelectedPlan(plan);
    setSearchParams({ plan });
    setFeedback('');
  }

  function openAddModal() {
    setEditingItem(null);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(item: MenuItem) {
    setEditingItem(item);
    setFormError('');
    setModalOpen(true);
  }

  async function handleFormSubmit(payload: MenuItemPayload) {
    setFormBusy(true);
    setFormError('');
    setFeedback('');
    try {
      if (editingItem) {
        await api.put(`/menus/${editingItem.id}`, payload);
        setFeedback(`Updated "${payload.foodName}" in ${selectedPlan}.`);
      } else {
        await api.post('/menus', payload);
        setFeedback(`Added "${payload.foodName}" to ${selectedPlan}.`);
      }
      setModalOpen(false);
      await fetchMenus(selectedPlan);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save menu item.'));
    } finally {
      setFormBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setError('');
    setFeedback('');
    try {
      await api.delete(`/menus/${deleteTarget.id}`);
      setFeedback(`Removed "${deleteTarget.foodName}" from ${selectedPlan}.`);
      setDeleteTarget(null);
      await fetchMenus(selectedPlan);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete menu item.'));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <DashboardLayout
      pageTitle="Menu Management"
      breadcrumb={`Administration / Menus / ${selectedPlan}`}
      headerAction={
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Food Item</span>
        </button>
      }
    >
      {/* Plan Selector Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Select Diet Plan
          </h2>
          <p className="text-xs text-slate-500">
            Each diet plan maintains an independent daily food menu.
          </p>
        </div>

        <div
          className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1"
          role="tablist"
          aria-label="Diet plans"
        >
          {DIET_PLANS.map((plan) => {
            const active = selectedPlan === plan;
            return (
              <button
                key={plan}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectPlan(plan)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {plan}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {feedback}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            No food items in {selectedPlan}
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            This plan currently has an empty menu. Add items across Breakfast,
            Morning Snack, Lunch, Evening Snack, and Dinner.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Food Item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {MEAL_CATEGORIES.map((category) => {
            const categoryItems = items.filter(
              (item) => item.mealCategory === category
            );
            return (
              <section
                key={category}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {category}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {categoryItems.length}{' '}
                    {categoryItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {categoryItems.length === 0 ? (
                  <div className="px-6 py-5 text-sm text-slate-500">
                    No {category.toLowerCase()} items added for {selectedPlan}.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {item.foodName}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit food item"
                            aria-label={`Edit ${item.foodName}`}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete food item"
                            aria-label={`Delete ${item.foodName}`}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <MenuItemModal
        open={modalOpen}
        selectedPlan={selectedPlan}
        editingItem={editingItem}
        busy={formBusy}
        serverError={formError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Food Item"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.foodName}" (${deleteTarget.mealCategory}) from the ${deleteTarget.dietPlan} menu?`
            : ''
        }
        confirmLabel="Delete Item"
        busy={deleteBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
