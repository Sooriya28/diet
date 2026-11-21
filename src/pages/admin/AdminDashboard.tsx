import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserCheck, Users } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import {
  DIET_PLANS,
  type DashboardStats,
  type MemberUser,
} from '../../types/index.ts';

export function AdminDashboard() {
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    planCounts: {
      'Weight Loss': 0,
      'Weight Gain': 0,
      'High Protein': 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const res = await api.get<{ users: MemberUser[]; stats: DashboardStats }>(
          '/users'
        );
        if (active) {
          setUsers(res.data.users);
          setStats(res.data.stats);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Failed to load dashboard data.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const recentUsers = users.slice(0, 5);

  return (
    <DashboardLayout
      pageTitle="Admin Dashboard"
      breadcrumb="Administration / Overview"
      headerAction={
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <span>Manage Users</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Dynamic Stat Grid */}
      <section aria-label="User statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Total Users</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {loading ? '—' : stats.totalUsers}
            </p>
            <p className="mt-1 text-xs text-slate-500">Registered members</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Active Users</span>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
              {loading ? '—' : stats.activeUsers}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {loading ? 'Loading...' : `${stats.inactiveUsers} inactive`}
            </p>
          </div>

          {DIET_PLANS.map((plan) => (
            <div
              key={plan}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <span className="text-xs font-medium text-slate-500">{plan}</span>
              <p className="mt-3 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {loading ? '—' : stats.planCounts[plan]}
              </p>
              <p className="mt-1 text-xs text-slate-500">Assigned users</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Plan Distribution Summary */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Plan Distribution Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Share of members enrolled in each predefined plan.
          </p>

          <div className="mt-6 space-y-5">
            {DIET_PLANS.map((plan) => {
              const count = stats.planCounts[plan] || 0;
              const pct =
                stats.totalUsers > 0
                  ? Math.round((count / stats.totalUsers) * 100)
                  : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{plan}</span>
                    <span className="font-mono text-xs text-slate-600 tabular-nums">
                      {count} users · {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              to="/admin/menus"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              <span>Manage Plan Menus</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Recent Users List */}
        <section className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Members
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Latest member accounts registered in the system.
              </p>
            </div>
            <Link
              to="/admin/users"
              className="whitespace-nowrap text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-10 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No members registered yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Create your first member account to issue a digital diet card.
              </p>
              <Link
                to="/admin/users"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Add First Member
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3">Member</th>
                    <th className="px-4 py-3">Card ID</th>
                    <th className="px-4 py-3">Assigned Plan</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-900">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-700 tabular-nums">
                        {member.dietCardId}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {member.assignedPlan}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span
                          className={`text-xs font-semibold ${
                            member.status === 'active'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {member.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
