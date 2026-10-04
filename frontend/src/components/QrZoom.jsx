import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function QrZoom({ src, alt = 'UPI QR code', isOpen, onClose, upiId, name }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-950/92 backdrop-blur-sm p-5 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} enlarged`}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 min-w-touch min-h-touch flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <p className="text-sm font-bold text-white text-center px-8">
        {name ? `${name}'s QR code` : 'QR code'}
      </p>

      {/*
        Always white: scanners need a light quiet zone around the modules, so this
        card stays paper-coloured even in dark mode.
      */}
      <div className="rounded-3xl bg-white p-4 shadow-2xl max-w-[min(88vw,420px)] aspect-square w-full flex items-center justify-center qr-paper">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {upiId && (
        <p className="text-xs font-bold text-cyan-300 text-center break-all px-8">{upiId}</p>
      )}

      <p className="text-[11px] font-medium text-slate-400 text-center">
        Scan with any UPI app &middot; tap anywhere to close
      </p>
    </div>
  );
}