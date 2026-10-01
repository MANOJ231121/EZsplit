import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, ShieldCheck, Users, Zap, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const { loginWithGoogleToken, loginDemoUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    const res = await loginWithGoogleToken(credentialResponse.credential);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Google login failed');
    }
  };

  const handleDemoLogin = async (email) => {
    setError('');
    setLoading(true);
    const res = await loginDemoUser(email);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center shadow-emerald-glow">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">SplitMate</span>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-brand-400 border border-slate-700">
          v1.0 Ready
        </span>
      </div>

      {/* Main Login Card Area */}
      <div className="max-w-md mx-auto w-full z-10 my-auto py-8">
        <div className="dark-glass-card rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-emerald-glow mb-2">
            <Wallet className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              SplitMate
            </h1>
            <p className="text-slate-400 font-medium text-base">
              "Split expenses. Stay friends."
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Real Google Auth Component & Button */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign In Was Cancelled')}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
                width="280"
              />
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Secure OAuth 2.0 authentication powered by Google
            </p>
          </div>

          {/* Demo Account Switcher for Instant Interactive Review */}
          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Or Instant Demo Sign-In
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('manoj@gmail.com')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left border border-slate-700 transition-all flex items-center gap-2 group"
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Manoj"
                  alt="Manoj"
                  className="w-7 h-7 rounded-full bg-slate-600"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-brand-400">Manoj</p>
                  <p className="text-[10px] text-slate-400 truncate">manoj@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('rahul@gmail.com')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left border border-slate-700 transition-all flex items-center gap-2 group"
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
                  alt="Rahul"
                  className="w-7 h-7 rounded-full bg-slate-600"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-brand-400">Rahul</p>
                  <p className="text-[10px] text-slate-400 truncate">rahul@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('aman@gmail.com')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left border border-slate-700 transition-all flex items-center gap-2 group"
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aman"
                  alt="Aman"
                  className="w-7 h-7 rounded-full bg-slate-600"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-brand-400">Aman</p>
                  <p className="text-[10px] text-slate-400 truncate">aman@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('rohit@gmail.com')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-left border border-slate-700 transition-all flex items-center gap-2 group"
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit"
                  alt="Rohit"
                  className="w-7 h-7 rounded-full bg-slate-600"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-brand-400">Rohit</p>
                  <p className="text-[10px] text-slate-400 truncate">rohit@gmail.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Features Showcase */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-center z-10 py-4">
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-300 text-xs font-medium">
          <Zap className="w-4 h-4 text-brand-400" />
          <span>Real-time Dynamic Balances</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Greedy Debt Simplification Engine</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-300 text-xs font-medium">
          <Users className="w-4 h-4 text-teal-400" />
          <span>Group & 1-on-1 Debt Settlement</span>
        </div>
      </div>
    </div>
  );
}
