import React, { useState, useEffect, useCallback } from 'react';
import { Hourglass, Check, X, Inbox } from 'lucide-react';
import { formatCurrency } from '../lib/upi';
import api from '../services/api';

export default function PendingIncomingCard({ onChanged }) {
  const [pending, setPending] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/settlements/pending/incoming');
      setPending(res.success && res.data ? res.data : []);
    } catch {
      setPending([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/settlements/${id}/${action}`);
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Could not update that payment');
    } finally {
      setBusyId(null);
    }
  };

  if (pending.length === 0 && !error) return null;

  return (
    <section className="rounded-2xl bg-white border border-amber-200 shadow-soft overflow-hidden">
      <header className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <Hourglass className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <h2 className="text-sm font-bold text-amber-900">
          {pending.length} payment{pending.length === 1 ? '' : 's'} to confirm
        </h2>
      </header>

      {error && (
        <p className="px-4 py-3 text-xs font-semibold text-red-600">{error}</p>
      )}

      <div className="divide-y divide-slate-100">
        {pending.map((item) => (
          <div key={item.id} className="p-4 flex items-center gap-3 min-w-0">
            <img
              src={item.fromUser?.profilePicture
                || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.fromUser?.name}`}
              alt={item.fromUser?.name}
              className="w-10 h-10 rounded-full border border-slate-200 object-cover flex-shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {item.fromUser?.name} sent ₹{formatCurrency(item.amount)}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                {new Date(item.createdAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => act(item.id, 'confirm')}
                disabled={busyId === item.id}
                className="min-h-touch px-3 rounded-xl bg-brand-500 active:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Received</span>
              </button>
              <button
                onClick={() => act(item.id, 'cancel')}
                disabled={busyId === item.id}
                aria-label="Not received"
                className="min-w-touch min-h-touch rounded-xl bg-slate-100 active:bg-slate-200 text-slate-600 flex items-center justify-center disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {pending.length === 0 && error && (
          <div className="p-6 text-center">
            <Inbox className="w-8 h-8 mx-auto text-slate-300" />
          </div>
        )}
      </div>
    </section>
  );
}