import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User as UserIcon,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export function LoginPage() {
  const { user, loading, adminConfigured, login, setupAdmin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (loading || adminConfigured === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-medium text-slate-600">Loading system...</p>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
        replace
      />
    );
  }

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password) {
      setError('Please enter both your username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const signedInUser = await login(username.trim(), password);
      navigate(
        signedInUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
        { replace: true }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetupSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (username.trim().length < 3 || /\s/.test(username.trim())) {
      setError('Admin username must be at least 3 characters with no spaces.');
      return;
    }
    if (password.length < 6) {
      setError('Admin password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const msg = await setupAdmin(username.trim(), password);
      setSuccessMsg(msg);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] lg:flex-row">
      {/* Left Brand Panel */}
      <div className="flex flex-col justify-between bg-[#0F172A] px-8 py-10 text-white lg:w-5/12 lg:px-14 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Diet Card Management System
            </span>
          </div>

          <h1 className="mt-10 max-w-md text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
            Structured nutrition plans and digital member diet cards.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
            Sign in with your administrator or member account to manage user
            profiles, issue digital diet cards, and view meal schedules tailored
            to each assigned plan.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 border-t border-slate-800 pt-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">
                Digital Diet Cards
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Automatic card IDs and verified member metrics.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UtensilsCrossed className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">
                Plan-Scoped Menus
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Weight Loss, Weight Gain, and High Protein schedules.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Authentication Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xs">
          {!adminConfigured ? (
            <>
              <div className="mb-6">
                <p className="text-xs font-medium text-emerald-700">
                  Initial System Setup
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Create Administrator Account
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  No administrator credentials are set in environment variables
                  yet. Configure your admin login once to initialize the system.
                </p>
              </div>

              <form onSubmit={handleSetupSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="setup-username"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Admin Username
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="setup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="setup-password"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="setup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pr-10 pl-10 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
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
                  <label
                    htmlFor="setup-confirm"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="setup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                >
                  {submitting ? 'Configuring...' : 'Initialize Admin Account'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Enter your administrator or member credentials provided by the
                  administrator.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {successMsg && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {successMsg}
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="login-username"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pr-10 pl-10 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                >
                  {submitting ? 'Signing in...' : 'Login'}
                </button>
              </form>

              <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                Member accounts are issued exclusively by the system administrator.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
