import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import QrZoom from '../components/QrZoom';
import ThemeToggle from '../components/ThemeToggle';
import {
  LogOut, ShieldCheck, Mail, IndianRupee, QrCode, AtSign, Trash2, Maximize2, Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isValidUpiId } from '../lib/upi';
import { useQrUpload } from '../lib/useQrUpload';
import api from '../services/api';

export default function AccountPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { qrPreview, uploading, qrError, handleFile, removeQr } = useQrUpload();
  const [upiDraft, setUpiDraft] = useState(user?.upiId || '');
  const [savingUpi, setSavingUpi] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [qrZoomOpen, setQrZoomOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const saveUpi = async () => {
    if (!isValidUpiId(upiDraft)) {
      setAccountError('Enter a valid UPI ID, for example yourname@okaxis');
      return;
    }
    setSavingUpi(true);
    setAccountError('');
    try {
      const res = await api.put('/payment/profile', { upiId: upiDraft.trim() });
      if (res.success) {
        await refreshUser();
      }
    } catch (err) {
      setAccountError(err.message || 'Could not save your UPI ID');
    } finally {
      setSavingUpi(false);
    }
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
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-brand-500 object-cover shadow-md flex-shrink-0"
              />

              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-slate-900 truncate">{user.name}</h2>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[11px] font-bold border border-cyan-200">
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

        {/* Payment Details Card */}
        {user && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  Payment Details
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Share a UPI ID or QR code so friends can pay you without asking for it again.
                </p>
              </div>
              {(user.upiId || user.hasUpiQr) && (
                <span className="flex-shrink-0 text-[11px] font-bold text-brand-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>

            <div>
              <label htmlFor="account-upi" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                GPay / UPI ID
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" />
                <input
                  id="account-upi"
                  type="text"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={upiDraft}
                  onChange={(e) => setUpiDraft(e.target.value)}
                  placeholder="yourname@okaxis"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
                />
              </div>
              {accountError && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{accountError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveUpi}
                disabled={savingUpi || !isValidUpiId(upiDraft)}
                className="flex-1 min-h-touch rounded-xl bg-brand-500 active:bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-brand-glow disabled:opacity-50"
              >
                {savingUpi ? 'Saving...' : 'Save UPI ID'}
              </button>
              {upiDraft === (user.upiId || '') && (
                <button
                  onClick={() => { setUpiDraft(''); setAccountError(''); }}
                  className="min-h-touch px-4 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                UPI QR code
              </span>

              {(qrPreview || uploading) ? (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQrZoomOpen(true)}
                    aria-label="Enlarge QR code"
                    className="relative flex-shrink-0 rounded-xl qr-paper focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
                  >
                    <img
                      src={qrPreview}
                      alt="Your UPI QR code"
                      className="w-24 h-24 object-contain rounded-xl border border-slate-200 bg-white"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">
                      {uploading ? 'Saving QR code...' : 'QR code saved'}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 mb-2">
                      Friends see this when they settle up with you.
                    </p>
                    <button
                      onClick={removeQr}
                      disabled={uploading}
                      className="min-h-touch px-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5 active:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 cursor-pointer active:border-brand-400 min-h-touch">
                  <QrCode className="w-7 h-7 text-slate-300" />
                  <span className="text-xs font-bold text-slate-700">
                    {uploading ? 'Processing...' : 'Upload your GPay QR'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Optional &middot; resized automatically</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
                </label>
              )}

              {qrError && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{qrError}</p>
              )}
            </div>
          </div>
        )}

        {/* App Settings Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Preferences</h3>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 min-w-0">
              <Moon className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block">Night Mode</span>
                <span className="text-[11px] font-medium text-slate-400 block">Darker colours at night</span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <IndianRupee className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Primary Currency</span>
            </div>
            <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">₹ (INR)</span>
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

      <QrZoom
        src={qrPreview}
        alt="Your UPI QR code"
        isOpen={qrZoomOpen}
        onClose={() => setQrZoomOpen(false)}
        upiId={user?.upiId}
        name="Your"
      />
    </div>
  );
}
