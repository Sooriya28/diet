import { useEffect, useState } from 'react';
import { Printer, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import type { DietCardData } from '../../types/index.ts';

export function MyDietCard() {
  const [card, setCard] = useState<DietCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await api.get<{ dietCard: DietCardData }>('/user/diet-card');
        if (active) {
          setCard(res.data.dietCard);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Failed to load digital diet card.'));
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
      pageTitle="My Diet Card"
      breadcrumb="Member Portal / My Diet Card"
      headerAction={
        card && (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            <span>Print Card</span>
          </button>
        )
      }
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-2xl border border-slate-200 bg-white" />
      ) : (
        card && (
          <div className="mx-auto max-w-2xl">
            <article className="print-only-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Deep Navy Card Header */}
              <div className="flex flex-col justify-between gap-4 bg-[#0F172A] px-6 py-6 text-white sm:flex-row sm:items-center sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-400">
                      Official Member Identification
                    </p>
                    <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                      {card.appName}
                    </h2>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">Diet Card ID</p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-white tabular-nums">
                    {card.dietCardId}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Cardholder Full Name
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {card.fullName}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Assigned Diet Plan
                    </p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">
                      {card.assignedPlan}
                    </p>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-slate-500">Age</dt>
                    <dd className="mt-1 font-mono text-base font-semibold text-slate-900 tabular-nums">
                      {card.age} yrs
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate-500">Height</dt>
                    <dd className="mt-1 font-mono text-base font-semibold text-slate-900 tabular-nums">
                      {card.height} cm
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate-500">Weight</dt>
                    <dd className="mt-1 font-mono text-base font-semibold text-slate-900 tabular-nums">
                      {card.weight} kg
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate-500">Status</dt>
                    <dd
                      className={`mt-1 text-base font-semibold ${
                        card.status === 'active'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {card.status === 'active' ? 'Active' : 'Inactive'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center">
                  <span className="font-mono tabular-nums">
                    Contact: {card.phone}
                  </span>
                  <span className="font-mono tabular-nums">
                    Issued: {new Date(card.issuedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </article>
          </div>
        )
      )}
    </DashboardLayout>
  );
}
