import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EzSplitLogo from '../components/EzSplitLogo';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({ icon: Icon, label, type = 'text', value, onChange, autoComplete, placeholder, inputMode, onToggleVisibility, visible }) {
  return (
    <div>
      <label htmlFor={label} className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <input
          id={label}
          name={label}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full h-12 pl-11 ${onToggleVisibility ? 'pr-11' : 'pr-4'} rounded-xl bg-white border border-slate-200 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-50`}
        />
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 active:text-brand-600 active:bg-brand-50 transition-colors"
          >
            {visible ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, register, loginWithGoogleToken } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleWidth, setGoogleWidth] = useState(300);
  const googleWrapRef = useRef(null);

  const isSignup = mode === 'signup';

  // Size the Google button to the available column so it never overflows a phone.
  useEffect(() => {
    const el = googleWrapRef.current;
    if (!el) return;
    const update = () => setGoogleWidth(Math.max(200, Math.floor(el.clientWidth)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setPassword('');
    setError('');
  };

  const validate = () => {
    if (isSignup && name.trim().length < 2) {
      return 'Please enter your full name.';
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (isSignup) {
      if (password.length < 8) {
        return 'Password must be at least 8 characters long.';
      }
      if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return 'Password must contain at least one letter and one number.';
      }
    } else if (!password) {
      return 'Please enter your password.';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSubmitting(true);
    const res = isSignup
      ? await register(name.trim(), email.trim(), password)
      : await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Something went wrong. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setSubmitting(true);
    const res = await loginWithGoogleToken(credentialResponse.credential);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Google sign in failed');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-slate-900">
      {/* Ambient cyan wash */}
      <div className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-96 w-96 rounded-full bg-cyan-50 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-10">
        {/* Brand panel - desktop only */}
        <div className="hidden lg:flex lg:flex-col lg:pr-8">
          <div className="flex items-center gap-3">
            <EzSplitLogo className="w-12 h-12" rounded="rounded-2xl" />
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">EzSplit</span>
          </div>

          <h1 className="mt-10 text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900">
            Split expenses.
            <br />
            <span className="text-brand-600">Stay friends.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-500">
            Track shared spending with friends, roommates and travel groups. EzSplit works out who owes
            whom and settles everything in the fewest possible transactions.
          </p>

          <div className="mt-10 space-y-3.5">
            {[
              { icon: Zap, text: 'Real-time balances across every group' },
              { icon: ShieldCheck, text: 'Minimum-transaction debt simplification' },
              { icon: Users, text: 'Group and one-on-one settlements' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span className="text-sm font-medium text-slate-600">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form column */}
        <div className="flex w-full flex-1 flex-col justify-center py-2 lg:py-0">
          <div className="mx-auto w-full max-w-[26rem]">
            {/* Mobile brand header */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <EzSplitLogo className="w-14 h-14" rounded="rounded-2xl" />
              <span className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">EzSplit</span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {isSignup ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  {isSignup
                    ? 'Start splitting expenses with your friends in seconds.'
                    : 'Sign in to continue to your dashboard.'}
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-left"
                >
                  <AlertCircle className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-red-500" />
                  <p className="text-[13px] font-semibold leading-snug text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                {isSignup && (
                  <div className="animate-fade-up">
                    <Field
                      icon={User}
                      label="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Manoj Kumar"
                    />
                  </div>
                )}

                <div className={isSignup ? 'animate-fade-up' : ''}>
                  <Field
                    icon={Mail}
                    label="Email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>

                <div className={isSignup ? 'animate-fade-up' : ''}>
                  <Field
                    icon={Lock}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
                    onToggleVisibility={() => setShowPassword((v) => !v)}
                    visible={showPassword}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-[15px] font-bold text-white shadow-brand-glow transition-all hover:bg-brand-600 active:scale-98 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span>{isSignup ? 'Creating account...' : 'Signing in...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignup ? 'Create account' : 'Sign in'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  or continue with
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div ref={googleWrapRef} className="flex w-full justify-center py-1">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign in was cancelled')}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                  width={String(googleWidth)}
                />
              </div>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate-400">
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                By continuing you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            {/* Account mode toggle */}
            <p className="mt-6 text-center text-sm text-slate-500">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="min-h-touch px-1 font-bold text-brand-600 underline-offset-4 transition-colors active:text-brand-700 active:underline"
              >
                {isSignup ? 'Sign in' : 'Create new account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
