export default function EzSplitLogo({ className = '', rounded = 'rounded-2xl' }) {
  return (
    <div
      className={`${rounded} bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center shadow-brand-glow shrink-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <text
          x="24"
          y="25"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
          fontSize="25"
          fontWeight="800"
          letterSpacing="-1.8"
        >
          Ez
        </text>
      </svg>
    </div>
  );
}
