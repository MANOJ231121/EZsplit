import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettleUpModal({ isOpen, onClose, targetFriend, defaultAmount = '', onSettled }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(defaultAmount || '');
  const [note, setNote] = useState('Payment settlement');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultAmount) setAmount(defaultAmount);
  }, [defaultAmount]);

  if (!isOpen || !targetFriend) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid settlement amount');
      return;
    }

    setSubmitting(true);
    try {
      // If positive balance: friend owes user -> so friend is paying user.
      // If negative balance: user owes friend -> so user is paying friend.
      const isUserPaying = targetFriend.balance < 0 || (defaultAmount && parseFloat(defaultAmount) > 0);

      const payload = {
        fromUserId: isUserPaying ? user.id : targetFriend.id,
        toUserId: isUserPaying ? targetFriend.id : user.id,
        amount: numAmount,
        note,
      };

      const res = await api.post('/settlements', payload);
      if (res.success) {
        onClose();
        if (onSettled) onSettled();
      } else {
        setError(res.message || 'Failed to record settlement');
      }
    } catch (err) {
      setError(err.message || 'Error recording settlement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-brand-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            <h2 className="font-bold text-lg">Settle Up Debt</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Transfer Visual Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col items-center">
              <img
                src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-brand-500 mb-1 object-cover"
              />
              <span className="text-xs font-bold text-slate-800">You</span>
            </div>

            <div className="flex flex-col items-center text-brand-600 font-bold">
              <ArrowRight className="w-6 h-6 stroke-[3]" />
              <span className="text-xs">Paying</span>
            </div>

            <div className="flex flex-col items-center">
              <img
                src={targetFriend.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetFriend.name}`}
                alt={targetFriend.name}
                className="w-12 h-12 rounded-full border-2 border-slate-300 mb-1 object-cover"
              />
              <span className="text-xs font-bold text-slate-800">{targetFriend.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Settlement Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-lg">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-extrabold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-brand-glow active:scale-98 transition-all disabled:opacity-50"
          >
            {submitting ? 'Recording Settlement...' : 'Confirm Settlement'}
          </button>
        </form>
      </div>
    </div>
  );
}
