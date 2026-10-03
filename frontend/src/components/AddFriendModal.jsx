import React, { useState } from 'react';
import { X, UserPlus, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function AddFriendModal({ isOpen, onClose, onRequestSent }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/friends/request', { email });
      if (res.success) {
        setSuccess(`Friend request sent to ${email}!`);
        setEmail('');
        setTimeout(() => {
          setSuccess('');
          onClose();
          if (onRequestSent) onRequestSent();
        }, 1500);
      } else {
        setError(res.message || 'Failed to send request');
      }
    } catch (err) {
      setError(err.message || 'Error sending friend request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            <h2 className="font-bold text-lg">Add a Friend</h2>
          </div>
          <button onClick={onClose} className="min-w-touch min-h-touch flex items-center justify-center rounded-full active:bg-white/20 transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Friend's Google Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400 w-5 h-5" />
              <input
                type="email"
                placeholder="e.g. rahul@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-base font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter their Google account email to send a EzSplit friend request.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-brand-glow active:scale-98 transition-all disabled:opacity-50"
          >
            {submitting ? 'Sending Request...' : 'Send Friend Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
