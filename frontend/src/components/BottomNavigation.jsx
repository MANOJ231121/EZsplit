import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, UsersRound, Plus, Activity, User } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `flex flex-1 flex-col items-center justify-center gap-1 min-h-touch rounded-xl text-xs font-medium transition-colors ${
    isActive ? 'text-brand-600 font-bold' : 'text-slate-500 active:bg-slate-100'
  }`;

export default function BottomNavigation({ onOpenAddExpense }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.12)] px-safe pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] pt-1.5">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        <NavLink to="/friends" className={linkClass}>
          <Users className="w-5 h-5" />
          <span>Friends</span>
        </NavLink>

        <NavLink to="/groups" className={linkClass}>
          <UsersRound className="w-5 h-5" />
          <span>Groups</span>
        </NavLink>

        {/* Floating primary action, kept clear of the home indicator */}
        <div className="relative -top-5 flex-1 flex justify-center">
          <button
            onClick={onOpenAddExpense}
            className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-brand-glow active:scale-95 transition-transform border-4 border-white"
            aria-label="Add Expense"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        <NavLink to="/activity" className={linkClass}>
          <Activity className="w-5 h-5" />
          <span>Activity</span>
        </NavLink>

        <NavLink to="/account" className={linkClass}>
          <User className="w-5 h-5" />
          <span>Account</span>
        </NavLink>
      </div>
    </nav>
  );
}
