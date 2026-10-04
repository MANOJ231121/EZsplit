import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, AtSign, QrCode, ShieldCheck, Smartphone, ArrowRight, Trash2, AlertCircle, Maximize2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isValidUpiId } from '../lib/upi';
import { useQrUpload } from '../lib/useQrUpload';
import api from '../services/api';
import EzSplitLogo from '../components/EzSplitLogo';
import QrZoom from '../components/QrZoom';

const inputClass =
  'w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-50';

export default function PaymentSetupPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { qrPreview, uploading, qrError, handleFile, removeQr } = useQrUpload();
  const [name, setName] = useState(user?.name || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrZoomOpen, setQrZoomOpen] = useState(false);

  const upiProvided = upiId.trim().length > 0;
  const upiValid = !upiProvided || isValidUpiId(upiId);
  const qrSaved = !!qrPreview || !!user?.hasUpiQr;
  // Either route is enough: many people only have a GPay QR screenshot. A typed
  // but malformed UPI ID is treated as a mistake worth correcting, not a fallback.
  const nameValid = name.trim().length >= 2;
  const canFinish = nameValid && (upiProvided ? upiValid : qrSaved);

  const persist = async (payload) => {
    const res = await api.put('/payment/profile', payload);
    if (res.success && res.data) {
      await refreshUser();
    }
    return res;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setShowErrors(true);
    setError('');
    if (!canFinish) return;

    setSaving(true);
    try {
      await persist({ name: name.trim(), upiId: upiId.trim(), setupComplete: true });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save your payment details');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await persist({ skipSetup: true });
    } catch {
      // A failed skip must not trap the user on this screen.
    } finally {
      setSaving(false);
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-safe pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-5">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <EzSplitLogo className="w-10 h-10" rounded="rounded-xl" />
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">Complete your profile</h1>
            <p className="text-xs font-medium text-slate-500">Step 1 of 1 &middot; takes a minute</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] space-y-5">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-brand-50 border border-cyan-100 p-4 flex gap-3">
          <Smartphone className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Add a UPI ID or upload your GPay QR once. Then anyone you settle up with can pay you
            straight from EzSplit &mdash; no need to exchange QR codes again.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {qrError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
            <span>{qrError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="setup-name" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
              Display name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" />
              <input
                id="setup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={`${inputClass} pl-11`}
              />
            </div>
            {showErrors && !nameValid && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">Please enter at least 2 characters</p>
            )}
          </div>

          <div>
            <label htmlFor="setup-upi" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
              GPay / UPI ID
              <span className="normal-case font-medium text-slate-400 ml-1">(or upload a QR below)</span>
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" />
              <input
                id="setup-upi"
                type="text"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@okaxis"
                className={`${inputClass} pl-11`}
              />
            </div>
            {showErrors && !upiValid ? (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                Enter a valid UPI ID, for example yourname@okaxis
              </p>
            ) : !upiProvided ? (
              <p className="mt-1.5 text-xs font-medium text-slate-500">
                Optional if you upload a QR below. In GPay: tap your profile &rarr; Show QR code.
              </p>
            ) : (
              <p className="mt-1.5 text-xs font-medium text-slate-500">
                Opens a prefilled payment in your UPI app.
              </p>
            )}
            {showErrors && !upiProvided && !qrSaved && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                Add a UPI ID or upload your QR code
              </p>
            )}
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
              QR code
              <span className="normal-case font-medium text-slate-400 ml-1">
                {upiProvided ? '(optional)' : '(required unless you add a UPI ID)'}
              </span>
            </span>

            {(qrPreview) ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQrZoomOpen(true)}
                  aria-label="Enlarge QR code"
                  className="relative flex-shrink-0 rounded-lg qr-paper focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
                >
                  <img src={qrPreview} alt="Your UPI QR code" className="w-24 h-24 object-contain rounded-lg" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">QR code saved</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 mb-2">
                    Friends can scan this to pay you.
                  </p>
                  <button
                    type="button"
                    onClick={removeQr}
                    className="min-h-touch px-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5 active:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 cursor-pointer active:border-brand-400 active:bg-brand-50/40 min-h-touch"
              >
                <QrCode className="w-8 h-8 text-slate-300" />
                <span className="text-xs font-bold text-slate-700">
                  {uploading ? 'Processing...' : 'Upload your GPay QR'}
                </span>
                <span className="text-[11px] font-medium text-slate-400">PNG, JPG or WEBP &middot; resized automatically</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full min-h-touch rounded-xl bg-brand-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-brand-glow active:scale-98 transition-all disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save and continue'}
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          className="w-full min-h-touch rounded-xl text-sm font-bold text-slate-500 active:text-slate-800"
        >
          Skip for now
        </button>

        <div className="flex items-start gap-2 pt-2">
          <ShieldCheck className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
            EzSplit never moves money itself. Payments open your own UPI app so you approve every
            transaction, and a balance only clears once the receiver confirms it.
          </p>
        </div>
      </main>

      <div className="h-1 w-24 mx-auto mb-4 rounded-full bg-slate-200" />

      <QrZoom
        src={qrPreview}
        alt="Your UPI QR code"
        isOpen={qrZoomOpen}
        onClose={() => setQrZoomOpen(false)}
        upiId={upiId}
        name="Your"
      />
    </div>
  );
}