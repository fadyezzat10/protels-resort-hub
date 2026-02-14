interface FlagProps {
  className?: string;
}

export function FlagGB({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
      <clipPath id="gb"><path d="M0 0v30h60V0z"/></clipPath>
      <g clipPath="url(#gb)">
        <path fill="#012169" d="M0 0v30h60V0z"/>
        <path stroke="#fff" strokeWidth="6" d="M0 0l60 30m0-30L0 30"/>
        <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30m0-30L0 30" clipPath="url(#gb)"/>
        <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60"/>
        <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60"/>
      </g>
    </svg>
  );
}

export function FlagSA({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={className}>
      <rect fill="#006C35" width="60" height="40"/>
      <text x="30" y="20" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fontFamily="serif">لا إله إلا الله</text>
      <path fill="#fff" d="M22 28l2-4h-4l3.5-2.5L22 19l1.5 2.5L27 19l-1.5 2.5L29 24h-4z"/>
    </svg>
  );
}

export function FlagFR({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={className}>
      <rect fill="#002395" width="20" height="40"/>
      <rect fill="#fff" x="20" width="20" height="40"/>
      <rect fill="#ED2939" x="40" width="20" height="40"/>
    </svg>
  );
}

export function FlagDE({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36" className={className}>
      <rect fill="#000" width="60" height="12"/>
      <rect fill="#DD0000" y="12" width="60" height="12"/>
      <rect fill="#FFCE00" y="24" width="60" height="12"/>
    </svg>
  );
}

export function FlagES({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={className}>
      <rect fill="#AA151B" width="60" height="40"/>
      <rect fill="#F1BF00" y="10" width="60" height="20"/>
    </svg>
  );
}

export function FlagRU({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={className}>
      <rect fill="#fff" width="60" height="13.3"/>
      <rect fill="#0039A6" y="13.3" width="60" height="13.4"/>
      <rect fill="#D52B1E" y="26.7" width="60" height="13.3"/>
    </svg>
  );
}

export function FlagPL({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={className}>
      <rect fill="#fff" width="60" height="20"/>
      <rect fill="#DC143C" y="20" width="60" height="20"/>
    </svg>
  );
}

export function FlagCZ({ className = "w-5 h-3.5" }: FlagProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={className}>
      <rect fill="#fff" width="60" height="20"/>
      <rect fill="#D7141A" y="20" width="60" height="20"/>
      <path fill="#11457E" d="M0 0l30 20L0 40z"/>
    </svg>
  );
}

export const flagComponents: Record<string, React.FC<FlagProps>> = {
  en: FlagGB,
  ar: FlagSA,
  fr: FlagFR,
  de: FlagDE,
  es: FlagES,
  ru: FlagRU,
  pl: FlagPL,
  cs: FlagCZ,
};
