import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AddFriendModal from '../components/AddFriendModal';
import SettleUpModal from '../components/SettleUpModal';
import api from '../services/api';
import { Search, UserPlus, Check, X, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [selectedFriendForSettle, setSelectedFriendForSettle] = useState(null);

  useEffect(() => {
    fetchFriendsAndRequests();
  }, []);

  const fetchFriendsAndRequests = async () => {
    setLoading(true);
    try {
      const [friendsRes, reqRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests'),
      ]);

      if (friendsRes.success) setFriends(friendsRes.data || []);
      if (reqRes.success) setRequests(reqRes.data || []);
    } catch (err) {
      console.error("Error fetching friends data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      const res = await api.post(`/friends/accept/${id}`);
      if (res.success) {
        fetchFriendsAndRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const res = await api.post(`/friends/reject/${id}`);
      if (res.success) {
        fetchFriendsAndRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Overall calculations for summary header card
  let totalYouOwe = 0;
  let totalYouAreOwed = 0;

  friends.forEach(f => {
    if (f.balance > 0) totalYouAreOwed += f.balance;
    if (f.balance < 0) totalYouOwe += Math.abs(f.balance);
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <Navbar title="Friends" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
        {/* Friends Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Friends</h1>
          <button
            onClick={() => setIsAddFriendOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-emerald-glow active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friends</span>
          </button>
        </div>

        {/* Total Balance Card inspired by reference image */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total balance with friends</span>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm font-bold text-red-500">
                You owe ₹{totalYouOwe.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-brand-600">
                You are owed ₹{totalYouAreOwed.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Friend Requests Banner */}
        {requests.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Friend Requests ({requests.length})
            </h3>
            <div className="space-y-2">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.sender?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender?.name}`}
                      alt={req.sender?.name}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{req.sender?.name}</p>
                      <p className="text-xs text-slate-400">{req.sender?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="p-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search friends by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-brand-500 outline-none shadow-soft"
          />
        </div>

        {/* Friends Cards List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-slate-200 rounded-2xl" />
            <div className="h-20 bg-slate-200 rounded-2xl" />
            <div className="h-20 bg-slate-200 rounded-2xl" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <UserPlus className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">No friends found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your friends using their Google email to start tracking shared expenses!
            </p>
            <button
              onClick={() => setIsAddFriendOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 shadow-emerald-glow"
            >
              Add Friend
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFriends.map((friend) => {
              const isOwed = friend.balance > 0;
              const isOwes = friend.balance < 0;
              const isSettled = friend.balance === 0;

              return (
                <div
                  key={friend.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={friend.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                    />

                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                        {friend.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{friend.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${
                        isOwed ? 'text-brand-600 font-extrabold' : isOwes ? 'text-red-500 font-extrabold' : 'text-slate-400'
                      }`}>
                        {friend.statusText}
                      </span>
                    </div>

                    {!isSettled && (
                      <button
                        onClick={() => setSelectedFriendForSettle(friend)}
                        className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        Settle up
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onRequestSent={() => fetchFriendsAndRequests()}
      />

      {/* Settle Up Modal */}
      <SettleUpModal
        isOpen={!!selectedFriendForSettle}
        onClose={() => setSelectedFriendForSettle(null)}
        targetFriend={selectedFriendForSettle}
        defaultAmount={selectedFriendForSettle ? Math.abs(selectedFriendForSettle.balance).toString() : ''}
        onSettled={() => {
          setSelectedFriendForSettle(null);
          fetchFriendsAndRequests();
        }}
      />
    </div>
  );
}
