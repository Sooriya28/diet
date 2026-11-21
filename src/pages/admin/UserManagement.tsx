import { useCallback, useEffect, useState } from 'react';
import {
  Edit2,
  Plus,
  Power,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog.tsx';
import {
  UserFormModal,
  type UserFormPayload,
} from '../../components/UserFormModal.tsx';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import api, { getApiErrorMessage } from '../../services/api.ts';
import { DIET_PLANS, type MemberUser } from '../../types/index.ts';

export function UserManagement() {
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MemberUser | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<MemberUser | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ users: MemberUser[] }>('/users', {
        params: {
          search: search.trim() || undefined,
          plan: planFilter !== 'all' ? planFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });
      setUsers(res.data.users);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  function openCreateModal() {
    setEditingUser(null);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(member: MemberUser) {
    setEditingUser(member);
    setFormError('');
    setModalOpen(true);
  }

  async function handleFormSubmit(payload: UserFormPayload) {
    setFormBusy(true);
    setFormError('');
    setFeedback('');
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        setFeedback(`Updated member "${payload.fullName}" successfully.`);
      } else {
        await api.post('/users', payload);
        setFeedback(`Created member "${payload.fullName}" and issued Diet Card.`);
      }
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Unable to save user.'));
    } finally {
      setFormBusy(false);
    }
  }

  async function handleToggleStatus(member: MemberUser) {
    setError('');
    setFeedback('');
    const nextStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${member.id}/status`, { status: nextStatus });
      setFeedback(
        `${member.fullName} is now ${nextStatus === 'active' ? 'active' : 'inactive'}.`
      );
      await fetchUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update user status.'));
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setError('');
    setFeedback('');
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setFeedback(`Deleted member "${deleteTarget.fullName}".`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete user.'));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <DashboardLayout
      pageTitle="User Management"
      breadcrumb="Administration / Users"
      headerAction={
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Member</span>
        </button>
      }
    >
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

      {/* Search & Filter Toolbar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, username, or Card ID..."
            className="w-full rounded-lg border border-slate-300 py-2 pr-3.5 pl-10 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            aria-label="Filter by diet plan"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">All Diet Plans</option>
            {DIET_PLANS.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by account status"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-11 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No matching members found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search || planFilter !== 'all' || statusFilter !== 'all'
                ? 'Try clearing your search or changing the active filters.'
                : 'Add your first member to generate a Diet Card ID and assign a diet plan.'}
            </p>
            {!search && planFilter === 'all' && statusFilter === 'all' && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Member</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Diet Card ID</th>
                  <th className="px-4 py-3.5">Metrics</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Assigned Plan</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">
                        {member.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        @{member.username}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-800 tabular-nums">
                      {member.dietCardId}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 tabular-nums">
                      {member.age} yrs · {member.height} cm · {member.weight} kg
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-800 tabular-nums">
                        {member.phone}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {member.assignedPlan}
                    </td>
                    <td className="px-4 py-3.5">
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
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          title="Edit member"
                          aria-label={`Edit ${member.fullName}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          title={
                            member.status === 'active'
                              ? 'Deactivate member'
                              : 'Activate member'
                          }
                          aria-label={
                            member.status === 'active'
                              ? `Deactivate ${member.fullName}`
                              : `Activate ${member.fullName}`
                          }
                          className={`rounded-lg p-2 transition-colors ${
                            member.status === 'active'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(member)}
                          title="Delete member"
                          aria-label={`Delete ${member.fullName}`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        open={modalOpen}
        editingUser={editingUser}
        busy={formBusy}
        serverError={formError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Member Account"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove ${deleteTarget.fullName} (${deleteTarget.dietCardId})? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Member"
        busy={deleteBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
