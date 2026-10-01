export default function EzSplitLogo({ className = '', rounded = 'rounded-2xl' }) {
  return (
    <div
      className={`${rounded} bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center shadow-brand-glow shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[58%] h-[58%]"
        aria-hidden="true"
      >
        <path
          d="M24 44V26.5c0-2.2 1-4.3 2.8-5.6L38 14"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 22.5V14h-8.5"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 44V26.5c0-2.2-1-4.3-2.8-5.6L10 14"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.62"
        />
        <path
          d="M10 22.5V14h8.5"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.62"
        />
        <circle cx="24" cy="8.5" r="4.6" fill="white" />
      </svg>
    </div>
  );
}
