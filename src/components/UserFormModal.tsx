import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { DIET_PLANS, type DietPlan, type MemberUser, type UserStatus } from '../types/index.ts';

export interface UserFormPayload {
  fullName: string;
  age: number;
  height: number;
  weight: number;
  phone: string;
  address: string;
  email: string;
  username: string;
  password: string;
  assignedPlan: DietPlan;
  status: UserStatus;
}

interface UserFormModalProps {
  open: boolean;
  editingUser: MemberUser | null;
  busy: boolean;
  serverError: string;
  onClose: () => void;
  onSubmit: (payload: UserFormPayload) => Promise<void>;
}

export function UserFormModal({
  open,
  editingUser,
  busy,
  serverError,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [assignedPlan, setAssignedPlan] = useState<DietPlan>('Weight Loss');
  const [status, setStatus] = useState<UserStatus>('active');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!open) return;
    setValidationError('');
    setShowPassword(false);

    if (editingUser) {
      setFullName(editingUser.fullName);
      setAge(String(editingUser.age));
      setHeight(String(editingUser.height));
      setWeight(String(editingUser.weight));
      setPhone(editingUser.phone);
      setAddress(editingUser.address);
      setEmail(editingUser.email);
      setUsername(editingUser.username);
      setPassword('');
      setAssignedPlan(editingUser.assignedPlan);
      setStatus(editingUser.status);
    } else {
      setFullName('');
      setAge('');
      setHeight('');
      setWeight('');
      setPhone('');
      setAddress('');
      setEmail('');
      setUsername('');
      setPassword('');
      setAssignedPlan('Weight Loss');
      setStatus('active');
    }
  }, [open, editingUser]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError('');

    const parsedAge = Number(age);
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);

    if (!fullName.trim()) {
      setValidationError('Full name is required.');
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      setValidationError('Please enter a valid positive age (1–120).');
      return;
    }
    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300) {
      setValidationError('Please enter a valid positive height in cm.');
      return;
    }
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500) {
      setValidationError('Please enter a valid positive weight in kg.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setValidationError('Please enter a valid phone number.');
      return;
    }
    if (!address.trim()) {
      setValidationError('Address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (username.trim().length < 3 || /\s/.test(username.trim())) {
      setValidationError('Username must be at least 3 characters with no spaces.');
      return;
    }
    if (!editingUser && password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    if (editingUser && password && password.length < 6) {
      setValidationError('New password must be at least 6 characters.');
      return;
    }

    await onSubmit({
      fullName: fullName.trim(),
      age: parsedAge,
      height: parsedHeight,
      weight: parsedWeight,
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim(),
      username: username.trim(),
      password,
      assignedPlan,
      status,
    });
  }

  const displayedError = validationError || serverError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="user-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {editingUser ? 'Edit Member Account' : 'Create New Member'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {editingUser
                ? `Diet Card ID: ${editingUser.dietCardId}`
                : 'A unique Diet Card ID will be generated automatically.'}
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

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {displayedError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {displayedError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ahmed Khan"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Age (years) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="24"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 tabular-nums focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Height (cm) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="172"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 tabular-nums focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Weight (kg) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="78"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 tabular-nums focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 tabular-nums focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmed@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="14 Green Park Avenue, Bengaluru"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Username <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ahmed"
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {editingUser ? 'New Password (optional)' : 'Password'}{' '}
                {!editingUser && <span className="text-red-600">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    editingUser ? 'Leave blank to keep current' : 'Min. 6 characters'
                  }
                  required={!editingUser}
                  className="w-full rounded-lg border border-slate-300 py-2 pr-10 pl-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Assigned Diet Plan <span className="text-red-600">*</span>
              </label>
              <select
                value={assignedPlan}
                onChange={(e) => setAssignedPlan(e.target.value as DietPlan)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
              >
                {DIET_PLANS.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>

            {editingUser && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
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
                : editingUser
                  ? 'Save Changes'
                  : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
