import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, CheckCircle, Calculator, Users, ArrowRight, Trash2, Edit3 } from 'lucide-react';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'balances', 'members'
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleTarget, setSettleTarget] = useState(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const [groupRes, expRes, balRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/expenses`),
        api.get(`/groups/${id}/balances`),
      ]);

      if (groupRes.success) setGroup(groupRes.data);
      if (expRes.success) setExpenses(expRes.data || []);
      if (balRes.success) setBalances(balRes.data);
    } catch (err) {
      console.error("Failed to load group details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await api.delete(`/expenses/${expenseId}`);
      if (res.success) {
        fetchGroupDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="Group Details" />
        <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-4">
          <div className="h-40 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Group not found</h2>
        <button onClick={() => navigate('/groups')} className="mt-4 text-brand-600 font-bold">Back to Groups</button>
      </div>
    );
  }

  const isOwed = group.myBalance > 0;
  const isOwes = group.myBalance < 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <Navbar title={group.name} />

      {/* Header Banner inspired by reference image */}
      <div className="bg-slate-900 text-white pt-6 pb-12 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-4">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Groups</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center font-black text-2xl shadow-emerald-glow">
                {group.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{group.name}</h1>
                <p className="text-xs text-slate-400 font-medium">{group.description || `${group.members?.length} members`}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expenses</span>
                <span className="text-base font-extrabold text-white">₹{group.totalExpenses}</span>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Balance</span>
                <span className={`text-base font-black ${
                  isOwed ? 'text-brand-400' : isOwes ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {isOwed ? `+₹${group.myBalance}` : isOwes ? `-₹${Math.abs(group.myBalance)}` : 'Settled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 -mt-6 space-y-6">
        {/* Navigation & Action Bar matching reference image */}
        <div className="p-2 rounded-2xl bg-white border border-slate-200/80 shadow-lg flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'expenses' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'balances' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Balances & Debts
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'members' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Members ({group.members?.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-emerald-glow active:scale-95 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Tab 1: Expenses List */}
        {activeTab === 'expenses' && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                <Calculator className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-800 text-base">No expenses recorded in this group yet</h3>
                <p className="text-xs text-slate-500">
                  Click the "+ Add Expense" button above to record your first shared expense.
                </p>
              </div>
            ) : (
              expenses.map((expense) => {
                const isPayer = expense.paidBy?.id === user.id;
                const mySplit = expense.participants?.find(p => p.user?.id === user.id);
                const myAmount = mySplit ? mySplit.amount : 0;

                return (
                  <div
                    key={expense.id}
                    className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex items-center justify-between hover:border-slate-300 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Date Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(expense.createdAt).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                        <span className="text-sm font-black text-slate-800 leading-none">
                          {new Date(expense.createdAt).getDate()}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{expense.description}</h4>
                        <p className="text-xs text-slate-400 font-medium">
                          {isPayer ? 'You paid' : `${expense.paidBy?.name || 'Someone'} paid`} ₹{expense.amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-xs font-black block ${
                          isPayer ? 'text-brand-600' : 'text-red-500'
                        }`}>
                          {isPayer
                            ? `you lent ₹${(expense.amount - myAmount).toFixed(2)}`
                            : `you borrowed ₹${myAmount.toFixed(2)}`}
                        </span>
                      </div>

                      {(isPayer || expense.createdBy?.id === user.id) && (
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Balances & Simplified Debt Transfers (Min-Transfers Algorithm Output) */}
        {activeTab === 'balances' && (
          <div className="space-y-6">
            {/* Simplified Transfers Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-600" />
                <span>Simplified Debt Settlements</span>
              </h3>
              <p className="text-xs text-slate-500">
                SplitMate's greedy min-transfers algorithm minimizes the number of money transactions required to settle all group debts.
              </p>

              {balances?.simplifiedTransactions?.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                  ✨ All group members are fully settled up! No transactions needed.
                </div>
              ) : (
                <div className="space-y-3">
                  {balances?.simplifiedTransactions?.map((tx, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={tx.fromUser?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tx.fromUser?.name}`}
                          alt={tx.fromUser?.name}
                          className="w-9 h-9 rounded-full border border-slate-200"
                        />
                        <span className="text-xs font-bold text-slate-900">
                          {tx.fromUser?.id === user.id ? 'You' : tx.fromUser?.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-brand-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {tx.toUser?.id === user.id ? 'You' : tx.toUser?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-slate-900">₹{tx.amount}</span>
                        {(tx.fromUser?.id === user.id || tx.toUser?.id === user.id) && (
                          <button
                            onClick={() => {
                              setSettleTarget({
                                id: tx.fromUser?.id === user.id ? tx.toUser?.id : tx.fromUser?.id,
                                name: tx.fromUser?.id === user.id ? tx.toUser?.name : tx.fromUser?.name,
                                profilePicture: tx.fromUser?.id === user.id ? tx.toUser?.profilePicture : tx.fromUser?.profilePicture,
                                balance: tx.fromUser?.id === user.id ? -tx.amount : tx.amount,
                              });
                              setIsSettleModalOpen(true);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                          >
                            Settle
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Individual Member Net Balances */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Group Member Balances</h3>
              <div className="space-y-2">
                {balances?.memberBalances?.map((mb) => (
                  <div key={mb.user?.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={mb.user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mb.user?.name}`}
                        alt={mb.user?.name}
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <span className="text-sm font-bold text-slate-800">
                        {mb.user?.id === user.id ? 'You' : mb.user?.name}
                      </span>
                    </div>

                    <span className={`text-xs font-black ${
                      mb.netBalance > 0 ? 'text-brand-600' : mb.netBalance < 0 ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {mb.netBalance > 0
                        ? `gets back ₹${mb.netBalance}`
                        : mb.netBalance < 0
                        ? `owes ₹${Math.abs(mb.netBalance)}`
                        : 'Settled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Members */}
        {activeTab === 'members' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Group Members ({group.members?.length})</h3>
            <div className="space-y-3">
              {group.members?.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                      alt={m.name}
                      className="w-9 h-9 rounded-full border border-slate-200"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {m.id === user.id ? `${m.name} (You)` : m.name}
                      </p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>

                  {m.id === group.createdBy && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Group Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        defaultGroupId={group.id}
        onExpenseAdded={() => fetchGroupDetails()}
      />

      {/* Settle Up Modal */}
      <SettleUpModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        targetFriend={settleTarget}
        defaultAmount={settleTarget ? Math.abs(settleTarget.balance).toString() : ''}
        onSettled={() => {
          setIsSettleModalOpen(false);
          fetchGroupDetails();
        }}
      />
    </div>
  );
}
