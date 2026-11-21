import { type ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { DietPlansPage } from './pages/admin/DietPlansPage.tsx';
import { MenuManagement } from './pages/admin/MenuManagement.tsx';
import { UserManagement } from './pages/admin/UserManagement.tsx';
import { MyDietCard } from './pages/user/MyDietCard.tsx';
import { MyMenu } from './pages/user/MyMenu.tsx';
import { MyProfile } from './pages/user/MyProfile.tsx';
import { UserDashboard } from './pages/user/UserDashboard.tsx';
import type { UserRole } from './types/index.ts';

function ProtectedRoute({
  allowedRole,
  children,
}: {
  allowedRole: UserRole;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-medium text-slate-600">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
        replace
      />
    );
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-medium text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
      replace
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menus"
            element={
              <ProtectedRoute allowedRole="admin">
                <MenuManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute allowedRole="admin">
                <DietPlansPage />
              </ProtectedRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute allowedRole="user">
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/diet-card"
            element={
              <ProtectedRoute allowedRole="user">
                <MyDietCard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/menu"
            element={
              <ProtectedRoute allowedRole="user">
                <MyMenu />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
