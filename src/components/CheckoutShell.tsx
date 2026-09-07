import { useState, type ReactNode } from 'react';
import { formatAmount } from '@/lib/format';
import { BrandLockup } from './BrandLockup';
import { CloseIcon, LockIcon } from './icons';

interface Merchant {
  name: string;
  logoUrl: string | null;
}

interface CheckoutShellProps {
  merchant: Merchant;
  amountMinor: string;
  currency: string;
  description: string | null;
  customerEmail?: string | null;
  embedded: boolean;
  onClose?: () => void;
  children: ReactNode;
}

function MerchantMark({
  merchant,
  large,
  tone,
}: {
  merchant: Merchant;
  large?: boolean;
  tone: 'light' | 'dark';
}) {
  const [broken, setBroken] = useState(false);
  const size = large ? 'w-14 h-14 text-[20px] rounded-2xl' : 'w-10 h-10 text-[15px] rounded-xl';
  if (merchant.logoUrl && !broken) {
    return (
      <img
        src={merchant.logoUrl}
        alt=""
        onError={() => setBroken(true)}
        className={`${size} object-cover bg-white ring-1 shrink-0 ${
          tone === 'light' ? 'ring-white/15' : 'ring-black/5'
        }`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${size} grid place-items-center font-bold shrink-0 ${
        tone === 'light'
          ? 'bg-white/10 text-white ring-1 ring-white/15'
          : 'bg-ice text-blue'
      }`}
    >
      {merchant.name.trim().slice(0, 1).toUpperCase()}
    </span>
  );
}

function Assurance({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <p
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
        tone === 'light' ? 'text-white/60' : 'text-muted'
      }`}
    >
      <LockIcon size={13} />
      Encrypted and verified before anything is delivered
    </p>
  );
}

/**
 * The frame every screen sits in. Hosted checkout splits into the Dannon Pay
 * summary panel and the payment panel; the popup keeps the same content in a
 * single compact card.
 */
export function CheckoutShell({
  merchant,
  amountMinor,
  currency,
  description,
  customerEmail,
  embedded,
  onClose,
  children,
}: CheckoutShellProps) {
  if (embedded) {
    return (
      <div className="bg-surface flex flex-col">
        <header className="px-6 pt-5 pb-4 flex items-start gap-3 border-b border-line-soft">
          <MerchantMark merchant={merchant} tone="dark" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-muted uppercase tracking-[0.08em]">
              Pay {merchant.name}
            </p>
            <p className="text-[24px] leading-[1.15] font-extrabold tracking-[-0.02em] tabular mt-0.5">
              {formatAmount(amountMinor, currency)}
            </p>
            {description && (
              <p className="text-[13px] text-body mt-1 truncate">{description}</p>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 -mr-2 w-9 h-9 rounded-full grid place-items-center text-muted hover:text-ink hover:bg-canvas transition-colors"
              aria-label="Close checkout"
            >
              <CloseIcon />
            </button>
          )}
        </header>

        <main className="px-6 py-6">{children}</main>

        <footer className="px-6 pb-5 pt-1 flex items-center justify-between gap-4 whitespace-nowrap">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted">
            <LockIcon size={13} />
            Encrypted and verified
          </p>
          <BrandLockup size="sm" />
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 0%, rgba(0, 94, 230, 0.35) 0%, transparent 70%), radial-gradient(50% 40% at 100% 100%, rgba(0, 94, 230, 0.22) 0%, transparent 70%)',
          }}
        />
        <div className="relative flex flex-col min-h-[260px] lg:min-h-screen px-6 py-6 sm:px-10 sm:py-10 lg:px-16 lg:py-12 lg:max-w-[600px] lg:ml-auto lg:w-full">
          <BrandLockup tone="light" />

          <div className="mt-8 lg:mt-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:py-16">
            <div className="flex items-center gap-4">
              <MerchantMark merchant={merchant} tone="light" large />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white/55 uppercase tracking-[0.1em]">
                  Pay {merchant.name}
                </p>
                <p className="text-[15px] font-medium text-white/85 mt-1 truncate">
                  {description ?? 'Secure payment'}
                </p>
              </div>
            </div>

            <h1 className="mt-7 text-[40px] sm:text-[52px] leading-none font-extrabold tracking-[-0.03em] tabular">
              {formatAmount(amountMinor, currency)}
            </h1>

            <dl className="mt-8 hidden sm:block rounded-card border border-white/10 bg-white/[0.04] divide-y divide-white/10 text-[14px]">
              {description && (
                <div className="flex items-center justify-between gap-6 px-5 py-3.5">
                  <dt className="text-white/70 truncate">{description}</dt>
                  <dd className="text-white/90 tabular shrink-0">{formatAmount(amountMinor, currency)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-6 px-5 py-3.5">
                <dt className="font-semibold text-white">Total due</dt>
                <dd className="font-semibold text-white tabular">{formatAmount(amountMinor, currency)}</dd>
              </div>
              {customerEmail && (
                <div className="flex items-center justify-between gap-6 px-5 py-3.5">
                  <dt className="text-white/55">Receipt to</dt>
                  <dd className="text-white/80 truncate">{customerEmail}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="hidden lg:block">
            <Assurance tone="light" />
          </div>
        </div>
      </aside>

      <section className="flex flex-col lg:min-h-screen">
        <main className="flex-1 flex items-start lg:items-center justify-center px-4 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-12">
          <div className="w-full max-w-[440px] lg:max-w-[420px] lg:mr-auto lg:ml-0">
            {children}
          </div>
        </main>
        <footer className="px-6 pb-6 sm:px-10 lg:px-16 flex items-center justify-between gap-3 text-[12px] text-muted lg:hidden">
          <Assurance tone="dark" />
          <BrandLockup size="sm" />
        </footer>
      </section>
    </div>
  );
}
