import React, { useState, useEffect } from 'react';
import {
  X, ArrowRight, CheckCircle, AlertCircle, Smartphone, QrCode, Hourglass, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/upi';
import api from '../services/api';

export default function SettleUpModal({ isOpen, onClose, targetFriend, defaultAmount = '', onSettled }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(defaultAmount || '');
  const [note, setNote] = useState('Payment settlement');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payee, setPayee] = useState(null);
  const [payeeLoading, setPayeeLoading] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    if (defaultAmount) setAmount(defaultAmount);
  }, [defaultAmount]);

  // Balance sign decides direction: negative means the current user owes the
  // friend, so the friend is the payee.
  const isUserPaying = targetFriend ? targetFriend.balance < 0 : true;

  useEffect(() => {
    if (!isOpen || !targetFriend) {
      setPayee(null);
      setPendingId(null);
      setError('');
      return;
    }
    let cancelled = false;
    const payeeId = isUserPaying ? targetFriend.id : user.id;
    const amountNum = parseFloat(amount);

    setPayeeLoading(true);
    const params = new URLSearchParams();
    if (Number.isFinite(amountNum) && amountNum > 0) params.set('amount', amountNum.toFixed(2));
    params.set('note', note || 'EzSplit settlement');

    api.get(`/payment/payee/${payeeId}?${params.toString()}`)
      .then((res) => {
        if (!cancelled && res.success) setPayee(res.data);
      })
      .catch((err) => {
        if (!cancelled) setPayee(null);
      })
      .finally(() => {
        if (!cancelled) setPayeeLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, targetFriend?.id, isUserPaying, amount, note, user.id]);

  if (!isOpen || !targetFriend) return null;

  const payeeProfile = isUserPaying ? targetFriend : user;
  const canPayByUpi = !!payee?.canRequestPayment;
  const hasDeepLink = canPayByUpi && !!payee?.upiIntentUri;
  const hasQr = canPayByUpi && !!payee?.upiQrImage;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid settlement amount');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fromUserId: isUserPaying ? user.id : targetFriend.id,
        toUserId: isUserPaying ? targetFriend.id : user.id,
        amount: numAmount,
        note,
      };

      const res = await api.post('/settlements', payload);
      if (res.success) {
        setPendingId(res.data?.id || null);
        if (onSettled) onSettled();
      } else {
        setError(res.message || 'Failed to record payment');
      }
    } catch (err) {
      setError(err.message || 'Error recording payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPending = async () => {
    if (!pendingId) return;
    try {
      await api.patch(`/settlements/${pendingId}/cancel`);
    } catch {
      // The record stays pending either way; nothing else to do here.
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] md:max-h-[90dvh]">
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-brand-500 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <h2 className="font-bold text-lg truncate">
              {pendingId ? 'Payment Sent' : 'Settle Up Debt'}
            </h2>
          </div>
          <button onClick={onClose} className="min-w-touch min-h-touch flex items-center justify-center rounded-full active:bg-white/20 transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {pendingId ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center">
              <Hourglass className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-amber-900">
                Waiting for {payeeProfile.name}
              </p>
              <p className="text-xs font-medium text-amber-800 mt-1">
                The balance clears only once they confirm the money arrived.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-500">Amount</span>
              <span className="font-extrabold text-slate-900">₹{formatCurrency(amount)}</span>
            </div>

            <button
              onClick={onClose}
              className="w-full min-h-touch rounded-xl bg-brand-500 text-white font-bold text-base shadow-brand-glow active:scale-98 transition-all"
            >
              Done
            </button>
            <button
              onClick={handleCancelPending}
              className="w-full min-h-touch rounded-xl text-xs font-bold text-slate-500 active:text-red-600 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              I did not send this payment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 gap-2">
              <div className="flex flex-col items-center min-w-0">
                <img
                  src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-brand-500 mb-1 object-cover flex-shrink-0"
                />
                <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]">You</span>
              </div>

              <div className="flex flex-col items-center text-brand-600 font-bold flex-shrink-0">
                <ArrowRight className="w-6 h-6 stroke-[3]" />
                <span className="text-xs">Paying</span>
              </div>

              <div className="flex flex-col items-center min-w-0">
                <img
                  src={targetFriend.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetFriend.name}`}
                  alt={targetFriend.name}
                  className="w-12 h-12 rounded-full border-2 border-slate-300 mb-1 object-cover flex-shrink-0"
                />
                <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]">{targetFriend.name}</span>
              </div>
            </div>

            <div>
              <label htmlFor="settle-amount" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-lg">₹</span>
                <input
                  id="settle-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-extrabold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {canPayByUpi && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-slate-800">
                    Pay {payeeProfile.name} directly
                  </p>
                </div>

                {payee?.upiQrImage && (
                  <div className="flex items-center gap-4">
                    <img
                      src={payee.upiQrImage}
                      alt={`${payee.name} UPI QR code`}
                      className="w-28 h-28 object-contain rounded-xl bg-white border border-slate-200 flex-shrink-0"
                    />
                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed min-w-0">
                      Scan with any UPI app, or use the button below to open your UPI app with the
                      amount already filled in.
                    </p>
                  </div>
                )}

                {payee?.upiId && (
                  <p className="text-[11px] font-semibold text-slate-500 break-all">
                    {payee.upiId}
                  </p>
                )}

                {hasDeepLink && (
                  <a
                    href={payee.upiIntentUri}
                    className="w-full min-h-touch rounded-xl bg-brand-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-brand-glow active:scale-98 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    Pay ₹{formatCurrency(amount)} in UPI app
                  </a>
                )}

                {!hasDeepLink && hasQr && (
                  <p className="text-[11px] font-semibold text-slate-500 text-center">
                    {payee.name} has not added a UPI ID, so scan their QR code above and enter
                    the amount in your UPI app.
                  </p>
                )}
              </div>
            )}

            {!payeeLoading && !canPayByUpi && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  {payeeProfile.name} has not added a UPI ID or QR code yet, so you cannot pay
                  them from here. Record the settlement manually once you have paid them another way.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="settle-note" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Note (Optional)
              </label>
              <input
                id="settle-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-slate-900 active:bg-slate-800 text-white font-bold text-base shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              {submitting
                ? 'Recording...'
                : canPayByUpi
                  ? 'I have paid - record as pending'
                  : 'Confirm Settlement'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}