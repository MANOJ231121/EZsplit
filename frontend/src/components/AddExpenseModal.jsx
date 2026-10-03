import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, Percent, Users, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded, defaultGroupId = null }) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [groupId, setGroupId] = useState(defaultGroupId || '');
  const [paidBy, setPaidBy] = useState(user?.id || '');
  const [splitType, setSplitType] = useState('EQUAL');

  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});
  const [customPcts, setCustomPcts] = useState({});

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGroupsAndFriends();
      if (user) setPaidBy(user.id);
    }
  }, [isOpen, user]);

  const fetchGroupsAndFriends = async () => {
    try {
      const [groupsRes, friendsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/friends'),
      ]);

      if (groupsRes.success) setAvailableGroups(groupsRes.data || []);
      if (friendsRes.success) setAvailableFriends(friendsRes.data || []);

      // Default members: Me + all friends (or group members if group selected)
      let initialMembers = [
        { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture }
      ];
      if (friendsRes.data) {
        friendsRes.data.forEach(f => {
          initialMembers.push({ id: f.id, name: f.name, email: f.email, profilePicture: f.profilePicture });
        });
      }
      setSelectedParticipants(initialMembers);
    } catch (err) {
      console.error("Failed to load contacts/groups:", err);
    }
  };

  useEffect(() => {
    if (groupId && availableGroups.length > 0) {
      const g = availableGroups.find(group => group.id === groupId);
      if (g && g.members) {
        setSelectedParticipants(g.members);
      }
    }
  }, [groupId, availableGroups]);

  const toggleParticipant = (member) => {
    if (selectedParticipants.some(p => p.id === member.id)) {
      if (selectedParticipants.length <= 1) {
        setError('Expense must include at least 1 person');
        return;
      }
      setSelectedParticipants(selectedParticipants.filter(p => p.id !== member.id));
    } else {
      setSelectedParticipants([...selectedParticipants, member]);
    }
  };

  const handleCustomAmountChange = (userId, val) => {
    setCustomAmounts({ ...customAmounts, [userId]: val });
  };

  const handleCustomPctChange = (userId, val) => {
    setCustomPcts({ ...customPcts, [userId]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (!description.trim()) {
      setError('Please enter an expense description');
      return;
    }

    if (selectedParticipants.length === 0) {
      setError('Please select participants to split this expense');
      return;
    }

    // Build participants array payload
    let participantsPayload = [];
    if (splitType === 'EQUAL') {
      participantsPayload = selectedParticipants.map(p => ({
        userId: p.id,
      }));
    } else if (splitType === 'EXACT') {
      let sum = 0;
      for (let p of selectedParticipants) {
        const val = parseFloat(customAmounts[p.id] || 0);
        sum += val;
        participantsPayload.push({
          userId: p.id,
          amount: val,
        });
      }
      if (Math.abs(sum - numAmount) > 0.01) {
        setError(`Custom amounts sum (₹${sum.toFixed(2)}) must equal total expense amount (₹${numAmount.toFixed(2)})`);
        return;
      }
    } else if (splitType === 'PERCENTAGE') {
      let sumPct = 0;
      for (let p of selectedParticipants) {
        const val = parseFloat(customPcts[p.id] || 0);
        sumPct += val;
        participantsPayload.push({
          userId: p.id,
          percentage: val,
        });
      }
      if (Math.abs(sumPct - 100) > 0.1) {
        setError(`Percentages sum (${sumPct.toFixed(1)}%) must equal 100%`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        description,
        amount: numAmount,
        paidBy: paidBy || user.id,
        splitType,
        groupId: groupId || null,
        category,
        participants: participantsPayload,
      };

      const endpoint = groupId ? `/groups/${groupId}/expenses` : '/expenses';
      const res = await api.post(endpoint, payload);

      if (res.success) {
        setDescription('');
        setAmount('');
        setCustomAmounts({});
        setCustomPcts({});
        onClose();
        if (onExpenseAdded) onExpenseAdded(res.data);
      } else {
        setError(res.message || 'Failed to save expense');
      }
    } catch (err) {
      setError(err.message || 'Error saving expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            <h2 className="font-bold text-lg">Add New Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="min-w-touch min-h-touch flex items-center justify-center rounded-full active:bg-white/20 transition-colors" aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Group (Optional)
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-base font-medium focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Non-group expense (With Friends)</option>
              {availableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner, Rent, Taxi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Paid By & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-base font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value={user.id}>You ({user.name})</option>
                {selectedParticipants.filter(p => p.id !== user.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-base font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="Food">Food & Drinks</option>
                <option value="Travel">Travel & Transport</option>
                <option value="Rent">Rent & Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Split Mode Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Split Mode
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSplitType('EQUAL')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  splitType === 'EQUAL' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Equal (=)
              </button>
              <button
                type="button"
                onClick={() => setSplitType('EXACT')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  splitType === 'EXACT' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exact (₹)
              </button>
              <button
                type="button"
                onClick={() => setSplitType('PERCENTAGE')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  splitType === 'PERCENTAGE' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Percentage (%)
              </button>
            </div>
          </div>

          {/* Split Participants List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Split Between ({selectedParticipants.length})
              </span>
              {splitType === 'EQUAL' && amount > 0 && (
                <span className="text-xs font-bold text-brand-600">
                  ₹{(parseFloat(amount) / Math.max(1, selectedParticipants.length)).toFixed(2)} each
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {/* Me + Friends list */}
              {[user, ...availableFriends].map((member) => {
                const isSelected = selectedParticipants.some(p => p.id === member.id);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isSelected ? 'border-brand-300 bg-brand-50/50' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div
                      onClick={() => toggleParticipant(member)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <img
                        src={member.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                        alt={member.name}
                        className="w-7 h-7 rounded-full bg-slate-200"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {member.id === user.id ? 'You' : member.name}
                      </span>
                    </div>

                    {isSelected && splitType === 'EXACT' && (
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customAmounts[member.id] || ''}
                          onChange={(e) => handleCustomAmountChange(member.id, e.target.value)}
                          className="w-full px-2 py-1 text-base border rounded-md font-bold focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                      </div>
                    )}

                    {isSelected && splitType === 'PERCENTAGE' && (
                      <div className="flex items-center gap-1 w-24">
                        <input
                          type="number"
                          step="1"
                          placeholder="%"
                          value={customPcts[member.id] || ''}
                          onChange={(e) => handleCustomPctChange(member.id, e.target.value)}
                          className="w-full px-2 py-1 text-base border rounded-md font-bold focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-brand-glow active:scale-98 transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving Expense...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
