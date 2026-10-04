import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    // The visible pill stays 32px, but the button itself keeps a 44px touch
    // target so it is comfortable to hit on a phone.
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Night mode"
      title={isDark ? 'Switch to light mode' : 'Switch to night mode'}
      className={`min-h-touch min-w-touch px-1 flex items-center justify-center rounded-full flex-shrink-0 ${className}`}
    >
      <span
        className={`relative w-[58px] h-8 rounded-full bg-slate-300 flex-shrink-0 transition-colors ${
          isDark ? 'bg-brand-500' : ''
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform ${
            isDark ? 'translate-x-[30px]' : 'translate-x-1'
          }`}
        >
          {isDark
            ? <Moon className="w-3.5 h-3.5 text-cyan-50" />
            : <Sun className="w-3.5 h-3.5 text-amber-500" />}
        </span>
      </span>
    </button>
  );
}