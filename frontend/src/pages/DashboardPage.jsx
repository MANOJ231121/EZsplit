import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AddExpenseModal from '../components/AddExpenseModal';
import api from '../services/api';
import { Plus, TrendingUp, TrendingDown, Wallet, Users, ArrowUpRight, ArrowDownLeft, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/summary');
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <Navbar title="Dashboard" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        {/* User Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Here is your financial balance overview.
            </p>
          </div>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="self-start sm:self-auto py-3 px-5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm flex items-center gap-2 shadow-brand-glow active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Dashboard Financial Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            <div className="h-32 bg-slate-200 rounded-3xl" />
            <div className="h-32 bg-slate-200 rounded-3xl" />
            <div className="h-32 bg-slate-200 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Net Balance Card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Balance</span>
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className={`text-3xl font-black tracking-tight ${
                  (summary?.netBalance || 0) >= 0 ? 'text-brand-400' : 'text-red-400'
                }`}>
                  {(summary?.netBalance || 0) >= 0 ? '+' : ''}₹{Math.abs(summary?.netBalance || 0).toLocaleString('en-IN')}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {(summary?.netBalance || 0) >= 0 ? 'Overall net credit' : 'Overall net debt'}
                </p>
              </div>
            </div>

            {/* You Owe Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">You Owe</span>
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-black text-red-500 tracking-tight">
                  ₹{(summary?.youOwe || 0).toLocaleString('en-IN')}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Money to pay friends</p>
              </div>
            </div>

            {/* You Are Owed Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">You Are Owed</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-brand-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-black text-brand-600 tracking-tight">
                  ₹{(summary?.youAreOwed || 0).toLocaleString('en-IN')}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Money owed to you</p>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout: Active Groups & Recent Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Groups Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-lg text-slate-900">Active Groups</h2>
              <button
                onClick={() => navigate('/groups')}
                className="min-h-touch px-2 -mr-2 text-xs font-bold text-brand-600 hover:text-brand-700 active:bg-brand-50 rounded-lg flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {summary?.activeGroups?.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No active groups yet</p>
                <button
                  onClick={() => navigate('/groups')}
                  className="min-h-touch px-4 rounded-xl bg-slate-900 active:bg-slate-800 text-white text-xs font-bold"
                >
                  Create Group
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {summary?.activeGroups?.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                          {group.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium truncate">
                          {group.members?.length || 0} members • ₹{group.totalExpenses || 0} total
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span className={`text-xs font-extrabold ${
                        (group.myBalance || 0) > 0
                          ? 'text-brand-600'
                          : (group.myBalance || 0) < 0
                          ? 'text-red-500'
                          : 'text-slate-400'
                      }`}>
                        {(group.myBalance || 0) > 0
                          ? `+₹${group.myBalance}`
                          : (group.myBalance || 0) < 0
                          ? `-₹${Math.abs(group.myBalance)}`
                          : 'Settled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-lg text-slate-900">Recent Expenses</h2>
              <button
                onClick={() => navigate('/activity')}
                className="min-h-touch px-2 -mr-2 text-xs font-bold text-brand-600 hover:text-brand-700 active:bg-brand-50 rounded-lg flex items-center gap-1"
              >
                <span>Full history</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {summary?.recentExpenses?.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                <Wallet className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-800 text-base">No expenses recorded yet</h3>
                <p className="text-xs text-slate-500">
                  Click the "+ Add Expense" button above to record your first shared bill.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary?.recentExpenses?.map((expense) => {
                  const isPayer = expense.paidBy?.id === user.id;
                  const mySplit = expense.participants?.find(p => p.user?.id === user.id);
                  const myAmount = mySplit ? mySplit.amount : 0;

                  return (
                    <div
                      key={expense.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex items-center justify-between hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          isPayer ? 'bg-cyan-50 text-brand-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {isPayer ? <ArrowUpRight className="w-5 h-5 stroke-[2.5]" /> : <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{expense.description}</h4>
                          <p className="text-xs text-slate-400 font-medium truncate">
                            {isPayer ? 'You paid' : `${expense.paidBy?.name || 'Someone'} paid`} ₹{expense.amount}
                            {expense.groupName && ` • ${expense.groupName}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <span className={`text-xs font-bold block whitespace-nowrap ${
                          isPayer ? 'text-brand-600' : 'text-red-500'
                        }`}>
                          {isPayer
                            ? `you lent ₹${(expense.amount - myAmount).toFixed(2)}`
                            : `you borrowed ₹${myAmount.toFixed(2)}`}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(expense.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={() => fetchDashboardSummary()}
      />
    </div>
  );
}
