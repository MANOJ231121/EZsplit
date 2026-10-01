import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EzSplitLogo from './EzSplitLogo';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3.5 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile App Logo */}
        <div className="md:hidden flex items-center gap-2">
          <EzSplitLogo className="w-9 h-9" rounded="rounded-xl" />
          <span className="font-bold text-lg text-slate-900 tracking-tight">EzSplit</span>
        </div>

        {/* Page Title for Desktop */}
        <h1 className="hidden md:block font-bold text-xl text-slate-900">
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/friends')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          title="Search friends"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/activity')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>

        {user && (
          <button
            onClick={() => navigate('/account')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200"
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
