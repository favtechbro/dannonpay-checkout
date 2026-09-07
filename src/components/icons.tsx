import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export function CardIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 9.5h19" />
      <path d="M6.5 14.5h3.5" />
    </svg>
  );
}

export function BankIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M4.5 9.5v8M9.5 9.5v8M14.5 9.5v8M19.5 9.5v8" />
      <path d="M2.5 19.5h19" />
    </svg>
  );
}

export function PhoneIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18h3" />
      <path d="M10 5.5h4" />
    </svg>
  );
}

export function LockIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function CopyIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5v-2a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2" />
    </svg>
  );
}

export function CheckIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} strokeWidth={2.25}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ChevronIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function BackIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function CloseIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Spinner({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} className={`animate-spin ${props.className ?? ''}`}>
      <circle cx="12" cy="12" r="9" opacity="0.2" strokeWidth={2.25} />
      <path d="M21 12a9 9 0 0 0-9-9" strokeWidth={2.25} />
    </svg>
  );
}
