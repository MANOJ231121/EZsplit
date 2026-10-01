import React, { useState, useEffect } from 'react';
import { X, Users, AlertCircle, Check } from 'lucide-react';
import api from '../services/api';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trip');
  const [friends, setFriends] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/friends').then(res => {
        if (res.success) setFriends(res.data || []);
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMember = (id) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        category,
        memberIds: selectedMemberIds,
      };

      const res = await api.post('/groups', payload);
      if (res.success) {
        setName('');
        setDescription('');
        setSelectedMemberIds([]);
        onClose();
        if (onGroupCreated) onGroupCreated(res.data);
      } else {
        setError(res.message || 'Failed to create group');
      }
    } catch (err) {
      setError(err.message || 'Error creating group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200 max-h-[90vh]">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            <h2 className="font-bold text-lg">Create New Group</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Goa Trip 2026, Room 402"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="Trip">Trip / Vacation</option>
                <option value="Home">Home / Apartment</option>
                <option value="Couple">Couple / Relationship</option>
                <option value="Event">Event / Party</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="4 day trip with friends"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Add Members from Friends ({selectedMemberIds.length})
            </label>

            {friends.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No friends available yet. Add friends first to include them in groups.</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {friends.map(f => {
                  const isSelected = selectedMemberIds.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => toggleMember(f.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={f.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name}`}
                          alt={f.name}
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{f.name}</p>
                          <p className="text-xs text-slate-400">{f.email}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            {submitting ? 'Creating Group...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
