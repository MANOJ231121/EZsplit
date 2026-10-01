import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, UsersRound, Plus, Activity, User } from 'lucide-react';

export default function BottomNavigation({ onOpenAddExpense }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Friends */}
        <NavLink
          to="/friends"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Friends</span>
        </NavLink>

        {/* Groups */}
        <NavLink
          to="/groups"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <UsersRound className="w-5 h-5" />
          <span>Groups</span>
        </NavLink>

        {/* Prominent Floating Central Add Expense Button */}
        <div className="relative -top-5">
          <button
            onClick={onOpenAddExpense}
            className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-emerald-glow transform hover:scale-105 active:scale-95 transition-all border-4 border-slate-50"
            aria-label="Add Expense"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Activity */}
        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <Activity className="w-5 h-5" />
          <span>Activity</span>
        </NavLink>

        {/* Account */}
        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </NavLink>
      </div>
    </nav>
  );
}
