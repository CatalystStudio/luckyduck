interface LuckyDuckLogoProps {
  className?: string;
  /** Compact mode hides the wordmark, showing only the mark */
  compact?: boolean;
}

export default function LuckyDuckLogo({ className = '', compact = false }: LuckyDuckLogoProps) {
  return (
    <svg
      viewBox={compact ? '0 0 40 32' : '0 0 200 32'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LuckyDuck"
      role="img"
    >
      {/* Abstract duck mark — minimal geometric bill + head curve */}
      <circle cx="14" cy="16" r="11" fill="#1B2E4A" />
      <ellipse cx="26" cy="17" rx="7" ry="4.5" fill="#F0845E" />
      <circle cx="11" cy="13.5" r="2" fill="#FFFFFF" />
      <circle cx="11" cy="13.5" r="1" fill="#1B2E4A" />

      {!compact && (
        <>
          {/* "Lucky" — soft navy */}
          <text
            x="40"
            y="23"
            fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
            fontSize="20"
            fontWeight="900"
            letterSpacing="-0.5"
            fill="#1B2E4A"
          >
            Lucky
          </text>
          {/* "Duck" — coral accent */}
          <text
            x="104"
            y="23"
            fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
            fontSize="20"
            fontWeight="900"
            letterSpacing="-0.5"
            fill="#F0845E"
          >
            Duck
          </text>
        </>
      )}
    </svg>
  );
}
