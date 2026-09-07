import mark from '@/assets/logo-mark.svg';
import glyph from '@/assets/logo-glyph-white.svg';

interface BrandLockupProps {
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

// The Dannon Pay mark and wordmark, composed the way the product does it.
export function BrandLockup({
  tone = 'dark',
  size = 'md',
  className = '',
}: BrandLockupProps) {
  const dimension = size === 'sm' ? 22 : 28;
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap ${className}`}>
      {tone === 'light' ? (
        <span
          className="grid place-items-center rounded-[7px] bg-white/10 ring-1 ring-white/15"
          style={{ width: dimension, height: dimension }}
        >
          <img
            src={glyph}
            alt=""
            width={dimension * 0.62}
            height={dimension * 0.62}
            aria-hidden="true"
          />
        </span>
      ) : (
        <img src={mark} alt="" width={dimension} height={dimension} aria-hidden="true" />
      )}
      <span
        className={`font-bold tracking-[-0.01em] ${size === 'sm' ? 'text-[14px]' : 'text-[17px]'} ${
          tone === 'light' ? 'text-white' : 'text-ink'
        }`}
      >
        Dannon Pay
      </span>
    </span>
  );
}
