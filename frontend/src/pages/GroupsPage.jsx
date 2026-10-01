import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreateGroupModal from '../components/CreateGroupModal';
import api from '../services/api';
import { UsersRound, Plus, ChevronRight, Wallet, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      if (res.success) {
        setGroups(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <Navbar title="Groups" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Groups</h1>
            <p className="text-xs text-slate-500 font-medium">Split expenses with roommates, trips, and friends.</p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-36 bg-slate-200 rounded-3xl" />
            <div className="h-36 bg-slate-200 rounded-3xl" />
          </div>
        ) : groups.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <UsersRound className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">No groups created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start splitting expenses with your friends by creating your first group!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 shadow-brand-glow"
            >
              Create Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => {
              const isOwed = group.myBalance > 0;
              const isOwes = group.myBalance < 0;

              return (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-xl hover:border-brand-200 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center font-black text-base shadow-brand-glow">
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                          {group.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {group.category || 'Trip'} • {group.members?.length || 0} members
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  {group.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{group.description}</p>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expenses</span>
                      <span className="text-sm font-extrabold text-slate-800">₹{group.totalExpenses}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Balance</span>
                      <span className={`text-sm font-black ${
                        isOwed ? 'text-brand-600' : isOwes ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {isOwed ? `+₹${group.myBalance}` : isOwes ? `-₹${Math.abs(group.myBalance)}` : 'Settled'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={() => fetchGroups()}
      />
    </div>
  );
}
