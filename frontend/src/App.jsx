import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';
import AddExpenseModal from './components/AddExpenseModal';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FriendsPage from './pages/FriendsPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ActivityPage from './pages/ActivityPage';
import AccountPage from './pages/AccountPage';
import PaymentSetupPage from './pages/PaymentSetupPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">Loading EzSplit...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // First-login nudge towards payment setup. Skippable, and never shown again
  // once the user either finishes setup or dismisses it.
  const needsSetup =
    !user?.paymentSetupComplete && !user?.paymentSetupDismissed;
  const isSetupPage = location.pathname === '/setup';

  if (needsSetup && !isSetupPage) {
    return <Navigate to="/setup" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';
  const isSetupPage = location.pathname === '/setup';
  const showAppChrome = isAuthenticated && !isLoginPage && !isSetupPage;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      {showAppChrome && (
        <Sidebar onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
      )}

      {/* Main Page Route View */}
      <div className="flex-1 min-w-0">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <PaymentSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {/* Mobile Bottom Navbar */}
      {showAppChrome && (
        <BottomNavigation onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
      )}

      {/* Global Add Expense Modal */}
      {showAppChrome && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onExpenseAdded={() => {
            // Trigger custom event or refresh current route if needed
            window.dispatchEvent(new Event('expense_added'));
          }}
        />
      )}
    </div>
  );
}
