import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Activity as ActivityIcon, Clock, CheckCircle, Calculator, UserPlus, UsersRound } from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity');
      if (res.success) {
        setActivities(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'EXPENSE_ADDED':
      case 'EXPENSE_UPDATED':
        return <Calculator className="w-5 h-5 text-brand-600" />;
      case 'SETTLEMENT_CREATED':
        return <CheckCircle className="w-5 h-5 text-cyan-600" />;
      case 'FRIEND_REQUEST_SENT':
      case 'FRIEND_REQUEST_ACCEPTED':
        return <UserPlus className="w-5 h-5 text-teal-600" />;
      case 'GROUP_CREATED':
      case 'GROUP_MEMBER_ADDED':
        return <UsersRound className="w-5 h-5 text-indigo-600" />;
      default:
        return <ActivityIcon className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <Navbar title="Activity Feed" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recent Activity</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time log of expenses, settlements, and friend updates.</p>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-slate-200 rounded-2xl" />
            <div className="h-20 bg-slate-200 rounded-2xl" />
            <div className="h-20 bg-slate-200 rounded-2xl" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <ActivityIcon className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">No activity recorded yet</h3>
            <p className="text-xs text-slate-500">
              When you add expenses, settle debts, or add friends, updates will appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex items-start gap-4 hover:border-slate-300 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getActivityIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
