import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { BmiCalculator } from '../../components/BmiCalculator.tsx';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import type { MemberUser } from '../../types/index.ts';

export function MyProfile() {
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
          setError(getApiErrorMessage(err, 'Failed to load profile.'));
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
      pageTitle="My Profile"
      breadcrumb="Member Portal / My Profile"
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      ) : (
        profile && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {profile.fullName}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Username: @{profile.username} · Diet Card ID:{' '}
                    <span className="font-mono text-slate-700 tabular-nums">
                      {profile.dietCardId}
                    </span>
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Read-only record</span>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Full Name
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-900">
                    {profile.fullName}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Age</dt>
                  <dd className="mt-1.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {profile.age} years
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Height / Weight
                  </dt>
                  <dd className="mt-1.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {profile.height} cm · {profile.weight} kg
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Phone Number
                  </dt>
                  <dd className="mt-1.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {profile.phone}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Email Address
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-900">
                    {profile.email}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Assigned Diet Plan
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-emerald-700">
                    {profile.assignedPlan}
                  </dd>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <dt className="text-xs font-medium text-slate-500">Address</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-slate-900">
                    {profile.address}
                  </dd>
                </div>
              </dl>
            </div>

            <BmiCalculator
              storedHeightCm={profile.height}
              storedWeightKg={profile.weight}
            />
          </div>
        )
      )}
    </DashboardLayout>
  );
}
