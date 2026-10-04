import React from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import EzSplitLogo from './EzSplitLogo';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] pb-3.5 md:px-8 md:pt-3.5 flex items-center justify-between px-safe">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile App Logo */}
        <div className="md:hidden flex items-center gap-2 min-w-0">
          <EzSplitLogo className="w-9 h-9" rounded="rounded-xl" />
          <span className="font-bold text-lg text-slate-900 tracking-tight truncate">EzSplit</span>
        </div>

        {/* Page Title for Desktop */}
        <h1 className="hidden md:block font-bold text-xl text-slate-900">
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-11 h-11 flex items-center justify-center text-slate-500 active:bg-slate-100 rounded-full transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to night mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to night mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={() => navigate('/friends')}
          className="w-11 h-11 flex items-center justify-center text-slate-500 active:bg-slate-100 rounded-full transition-colors"
          title="Search friends"
          aria-label="Search friends"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/activity')}
          className="w-11 h-11 flex items-center justify-center text-slate-500 active:bg-slate-100 rounded-full transition-colors relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />
        </button>

        {user && (
          <button
            onClick={() => navigate('/account')}
            className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200 min-w-touch min-h-touch"
            aria-label="Your account"
          >
            <img
              src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-300 object-cover"
            />
          </button>
        )}
      </div>
    </header>
  );
}
