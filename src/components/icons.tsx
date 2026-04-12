interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function CarIcon({ size = 24, color = '#FFCC00', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M5 17C5 17.5523 5.44772 18 6 18H7C7.55228 18 8 17.5523 8 17V16H16V17C16 17.5523 16.4477 18 17 18H18C18.5523 18 19 17.5523 19 17V13L16.868 9.75199C16.6046 9.30999 16.1421 9 15.632 9H8.36803C7.8579 9 7.39543 9.30999 7.13203 9.75199L5 13V17Z" 
        fill={color}
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="15.5" r="1.5" fill="#111827" />
      <circle cx="16.5" cy="15.5" r="1.5" fill="#111827" />
      <path 
        d="M8 9V6C8 5.44772 8.44772 5 9 5H15C15.5523 5 16 5.44772 16 6V9" 
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function PersonIcon({ size = 24, color = '#00A6FF', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="8" r="4" fill={color} stroke="#111827" strokeWidth="1.5" />
      <path 
        d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20" 
        fill={color}
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeIcon({ size = 24, color = '#4F46E5', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M3 12L5 10M5 10V17C5 17.5523 5.44772 18 6 18H9V14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V18H18C18.5523 18 19 17.5523 19 17V10M5 10L11.1819 4.70631C11.507 4.42081 11.9696 4.42081 12.2947 4.70631L19 10M19 10L21 12" 
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function WorkIcon({ size = 24, color = '#10B981', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="6" width="16" height="12" rx="2" fill={color} stroke="#111827" strokeWidth="1.5" />
      <path d="M8 6V5C8 4.44772 8.44772 4 9 4H15C15.5523 4 16 4.44772 16 5V6" stroke="#111827" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="13" x2="12" y2="13" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AirportIcon({ size = 24, color = '#F59E0B', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 3L21 7.5L12 12L3 7.5L12 3Z" 
        fill={color}
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M21 7.5V16.5L12 21L3 16.5V7.5" 
        stroke="#111827"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="12" y1="12" x2="12" y2="21" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function WalletIcon({ size = 24, color = '#8B5CF6', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="6" width="16" height="12" rx="2" fill={color} stroke="#111827" strokeWidth="1.5" />
      <rect x="14" y="10" width="4" height="4" rx="1" fill="white" stroke="#111827" strokeWidth="1" />
      <path d="M8 10H12" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ size = 24, color = '#FBBF24', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 16L5.5 21.5L8 14L2 9.5H9.5L12 2Z" 
        fill={color}
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavigationIcon({ size = 24, color = '#EF4444', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 2L19 21L12 17L5 21L12 2Z" 
        fill={color}
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon({ size = 24, color = '#10B981', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="6" y="3" width="12" height="18" rx="3" fill={color} stroke="#111827" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="1" fill="#111827" />
    </svg>
  );
}

export function MessageIcon({ size = 24, color = '#3B82F6', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="6" width="18" height="12" rx="2" fill={color} stroke="#111827" strokeWidth="1.5" />
      <path d="M3 10L12 14L21 10" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function MenuIcon({ size = 24, color = '#111827', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ size = 24, color = '#6B7280', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="16" y1="16" x2="20" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 24, color = '#6B7280', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ClockIcon({ size = 24, color = '#6B7280', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M12 6V12L16 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function CreditCardIcon({ size = 24, color = '#6B7280', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="6" width="18" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="14" x2="8" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="14" x2="12" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 24, color = '#6B7280', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M9 6L15 12L9 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function CheckIcon({ size = 24, color = '#10B981', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M5 13L9 17L19 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function XIcon({ size = 24, color = '#EF4444', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function MapPinIcon({ size = 24, color = '#EF4444', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 21C16 17 20 13.4183 20 10C20 6.13401 16.4183 3 12 3C7.58172 3 4 6.13401 4 10C4 13.4183 8 17 12 21Z" 
        fill={color}
        stroke="#111827"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="3" fill="white" stroke="#111827" strokeWidth="1.5" />
    </svg>
  );
}

export function HistoryIcon({ size = 24, color = '#4F46E5', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" fill="none" />
      <path d="M12 8V12L14 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12H8M16 12H20M12 4V8M12 16V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GiftIcon({ size = 24, color = '#EC4899', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="8" width="16" height="10" rx="2" fill={color} stroke="none" />
      <rect x="10" y="3" width="4" height="5" fill={color} stroke="none" />
      <path d="M8 3C8 3 10 5 12 5C14 5 16 3 16 3" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="12" y1="3" x2="12" y2="18" stroke="white" strokeWidth="2" />
      <line x1="4" y1="8" x2="20" y2="8" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export function UsersIcon({ size = 24, color = '#10B981', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.85" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ size = 24, color = '#059669', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 2L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 2Z" 
        fill={color}
        stroke="none"
      />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon({ size = 24, color = '#64748B', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

export function HelpIcon({ size = 24, color = '#3B82F6', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
  );
}

export function ChartIcon({ size = 24, color = '#8B5CF6', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MoneyIcon({ size = 24, color = '#10B981', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path d="M12 6v12M9 9c0-.5.5-1 1-1h4c.5 0 1 .5 1 1v2c0 .5-.5 1-1 1h-4c-.5 0-1 .5-1 1v2c0 .5.5 1 1 1h4c.5 0 1-.5 1-1" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TrophyIcon({ size = 24, color = '#F59E0B', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M6 9l2-2h8l2 2v6a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V9z" 
        fill={color}
        stroke="none"
      />
      <path d="M6 9H4a2 2 0 0 1 0-4h2M18 9h2a2 2 0 0 0 0-4h-2M10 17v3M14 17v3M8 21h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="11" r="1" fill="white" />
    </svg>
  );
}

export function CarDocumentIcon({ size = 24, color = '#64748B', className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" fill="none" />
      <polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2" fill="none" />
      <line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth="2" />
      <line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth="2" />
      <polyline points="10 9 9 9 8 9" stroke={color} strokeWidth="2" />
    </svg>
  );
}