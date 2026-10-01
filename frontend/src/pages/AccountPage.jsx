import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { LogOut, ShieldCheck, Mail, User, IndianRupee, Globe, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <Navbar title="Account" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Settings</h1>
          <p className="text-xs text-slate-500 font-medium">Manage your EzSplit profile and authentication.</p>
        </div>

        {/* Profile Details Card */}
        {user && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-brand-500 object-cover shadow-md"
              />

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold border border-cyan-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.googleId ? 'Google OAuth 2.0 Authenticated' : 'Password Authenticated'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block">User ID</span>
                <span className="font-bold text-slate-800 font-mono text-[11px] truncate block">{user.id}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block">Linked Google ID</span>
                <span className="font-bold text-slate-800 font-mono text-[11px] truncate block">{user.googleId || 'Not linked'}</span>
              </div>
            </div>
          </div>
        )}

        {/* App Settings Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Preferences</h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <IndianRupee className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Primary Currency</span>
            </div>
            <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">₹ (INR)</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Deployment Target</span>
            </div>
            <span className="text-xs font-extrabold text-brand-600 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-200">
              Vercel + Railway + Atlas
            </span>
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </main>
    </div>
  );
}
