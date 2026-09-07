import type { ReactNode } from 'react';
import { formatAmount } from '@/lib/format';

interface CheckoutShellProps {
  merchantName: string;
  merchantLogoUrl: string | null;
  amountMinor: string;
  currency: string;
  description: string | null;
  embedded: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export function CheckoutShell({
  merchantName,
  merchantLogoUrl,
  amountMinor,
  currency,
  description,
  embedded,
  onClose,
  children,
}: CheckoutShellProps) {
  return (
    <div
      className={
        embedded
          ? 'min-h-screen bg-surface flex flex-col'
          : 'min-h-screen bg-canvas flex flex-col items-center px-4 py-6 sm:py-12'
      }
    >
      <main
        className={
          embedded
            ? 'w-full flex-1 flex flex-col'
            : 'w-full max-w-[460px] rounded-2xl bg-surface border border-line shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.18)] overflow-hidden'
        }
      >
        <header className="px-5 sm:px-6 pt-6 pb-5 border-b border-line">
          <div className="flex items-start gap-3">
            {merchantLogoUrl ? (
              <img
                src={merchantLogoUrl}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-line shrink-0"
              />
            ) : (
              <span
                aria-hidden="true"
                className="w-10 h-10 rounded-lg grid place-items-center text-[15px] font-semibold shrink-0"
                style={{ background: 'var(--brand)', color: 'var(--brand-ink)' }}
              >
                {merchantName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-muted">Paying {merchantName}</p>
              <h1 className="text-[26px] leading-8 font-bold tracking-tight">
                {formatAmount(amountMinor, currency)}
              </h1>
              {description && (
                <p className="text-[13px] text-muted mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
            {embedded && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-lg grid place-items-center text-muted hover:bg-canvas"
                aria-label="Close checkout"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 4 4 12M4 4l8 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </header>

        <div className="px-5 sm:px-6 py-6 flex-1">{children}</div>

        <footer className="px-5 sm:px-6 pb-6">
          <p className="text-[12px] text-muted text-center">
            Secured by Dannon Pay
          </p>
        </footer>
      </main>
    </div>
  );
}
