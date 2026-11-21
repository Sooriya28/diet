import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import {
  DIET_PLANS,
  MEAL_CATEGORIES,
  type DashboardStats,
  type DietPlan,
} from '../../types/index.ts';

const PLAN_DETAILS: Record<DietPlan, { summary: string; focus: string }> = {
  'Weight Loss': {
    summary:
      'Calorie-controlled daily meals emphasizing whole grains, fresh produce, and light evening portions.',
    focus: 'Balanced fiber · Portion moderation · Light dinners',
  },
  'Weight Gain': {
    summary:
      'Energy-dense meals combining healthy fats, complex carbohydrates, and nutrient-rich snacks.',
    focus: 'Caloric surplus · Healthy fats · Frequent snacking',
  },
  'High Protein': {
    summary:
      'Protein-forward daily menu featuring lean meats, eggs, dairy, legumes, and recovery snacks.',
    focus: 'Lean protein · Legumes & dairy · Muscle recovery',
  },
};

export function DietPlansPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [menuCounts, setMenuCounts] = useState<Record<DietPlan, number>>({
    'Weight Loss': 0,
    'Weight Gain': 0,
    'High Protein': 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [usersRes, menusRes] = await Promise.all([
          api.get<{ stats: DashboardStats }>('/users'),
          api.get<{ counts: Record<DietPlan, number> }>('/menus'),
        ]);
        if (active) {
          setStats(usersRes.data.stats);
          setMenuCounts(menusRes.data.counts);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Failed to load plan overview.'));
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
      pageTitle="Diet Plans"
      breadcrumb="Administration / Predefined Plans"
    >
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Three Fixed Diet Plan Categories
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Every member is assigned to one of these predefined plans. Each
              plan is structured across {MEAL_CATEGORIES.length} daily meal
              categories ({MEAL_CATEGORIES.join(', ')}).
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {DIET_PLANS.map((plan) => {
          const assignedUsers = stats?.planCounts[plan] ?? 0;
          const totalItems = menuCounts[plan] ?? 0;
          const details = PLAN_DETAILS[plan];

          return (
            <article
              key={plan}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">{plan}</h3>
                  <span className="font-mono text-xs font-medium text-emerald-700 tabular-nums">
                    {loading ? '—' : `${assignedUsers} users`}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {details.summary}
                </p>

                <p className="mt-4 text-xs text-slate-500">{details.focus}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">Assigned Members</p>
                    <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {loading ? '—' : assignedUsers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Menu Items</p>
                    <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                      {loading ? '—' : totalItems}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  to={`/admin/menus?plan=${encodeURIComponent(plan)}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  <span>Manage {plan} Menu</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
