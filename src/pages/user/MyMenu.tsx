import { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import type { MemberMenuResponse } from '../../types/index.ts';

export function MyMenu() {
  const [menuData, setMenuData] = useState<MemberMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        // Strictly derived from authenticated session on the backend (no plan query param sent)
        const res = await api.get<MemberMenuResponse>('/user/menu');
        if (active) {
          setMenuData(res.data);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Failed to load your diet menu.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout
      pageTitle="My Menu"
      breadcrumb={
        menuData
          ? `Member Portal / My Menu / ${menuData.assignedPlan}`
          : 'Member Portal / My Menu'
      }
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
      ) : (
        menuData && (
          <div className="space-y-6">
            {/* Assigned Plan Header */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium text-emerald-700">
                    Assigned Nutrition Schedule
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {menuData.assignedPlan} Plan Menu
                  </h2>
                  {menuData.planDescription && (
                    <p className="mt-1.5 text-sm text-slate-600">
                      {menuData.planDescription}
                    </p>
                  )}
                </div>
                <div className="shrink-0 font-mono text-xs font-medium text-slate-500 tabular-nums">
                  {menuData.items.length} total items
                </div>
              </div>
            </section>

            {menuData.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  No menu items published yet
                </h3>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  The administrator has not added food items to the{' '}
                  {menuData.assignedPlan} plan yet. Check back soon.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {menuData.categories.map(({ category, items }) => (
                  <section
                    key={category}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {category}
                      </h3>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <div className="px-6 py-5 text-sm text-slate-500">
                        No items listed for {category.toLowerCase()}.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <div key={item.id} className="px-6 py-4">
                            <p className="font-semibold text-slate-900">
                              {item.foodName}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </DashboardLayout>
  );
}
