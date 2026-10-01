import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UsersRound, Activity, User, Plus, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onOpenAddExpense }) {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Friends', path: '/friends', icon: Users },
    { label: 'Groups', path: '/groups', icon: UsersRound },
    { label: 'Activity', path: '/activity', icon: Activity },
    { label: 'Account', path: '/account', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 min-h-screen border-r border-slate-800 p-5 sticky top-0 h-screen">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-emerald-glow">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl text-white tracking-tight">SplitMate</h1>
          <p className="text-xs text-brand-400 font-medium">Expense Sharing</p>
        </div>
      </div>

      {/* Add Expense Action Button */}
      <button
        onClick={onOpenAddExpense}
        className="w-full mb-6 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 shadow-emerald-glow transition-all transform active:scale-95"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>Add Expense</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Card */}
      {user && (
        <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 px-2">
          <img
            src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
