import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, User as UserIcon, UtensilsCrossed } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import type { MemberUser } from '../../types/index.ts';

export function UserDashboard() {
  const [profile, setProfile] = useState<MemberUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await api.get<{ profile: MemberUser }>('/user/profile');
        if (active) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Failed to load dashboard.'));
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
      pageTitle="Member Dashboard"
      breadcrumb="Member Portal / Dashboard"
      headerAction={
        <Link
          to="/user/menu"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <span>View My Menu</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      ) : (
        profile && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <section className="rounded-xl border border-slate-200 bg-[#0F172A] p-6 text-white sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-medium text-emerald-400">
                    Active Member Account
                  </p>
                  <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Welcome back, {profile.fullName}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-slate-300">
                    Your nutrition schedule is currently configured under the{' '}
                    <span className="font-semibold text-white">
                      {profile.assignedPlan}
                    </span>{' '}
                    plan. Access your digital diet card and daily meal schedule
                    below.
                  </p>
                </div>

                <div className="shrink-0 rounded-xl border border-slate-700 bg-slate-800/70 px-5 py-4">
                  <p className="text-xs text-slate-400">Diet Card ID</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-emerald-400 tabular-nums">
                    {profile.dietCardId}
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-500">
                  Assigned Diet Plan
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {profile.assignedPlan}
                </p>
                <Link
                  to="/user/menu"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  <span>Open My Menu</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-500">
                  Recorded Metrics
                </p>
                <p className="mt-2 font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {profile.age} yrs · {profile.height} cm · {profile.weight} kg
                </p>
                <Link
                  to="/user/profile"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-500">
                  Digital Diet Card
                </p>
                <p className="mt-2 font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {profile.dietCardId}
                </p>
                <Link
                  to="/user/diet-card"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  <span>Open Diet Card</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Personal Information Summary & Direct Links */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Personal Information Summary
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Profile details are maintained by the administrator.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/user/profile"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/user/diet-card"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>My Diet Card</span>
                  </Link>
                  <Link
                    to="/user/menu"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#0F172A] px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    <span>My Menu</span>
                  </Link>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs text-slate-500">Full Name</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {profile.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Email Address</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {profile.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Phone Number</dt>
                  <dd className="mt-1 font-mono text-sm font-medium text-slate-900 tabular-nums">
                    {profile.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Address</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {profile.address}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )
      )}
    </DashboardLayout>
  );
}
