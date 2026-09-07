import { useEffect, useState } from 'react';
import type { TransferAccount } from '@/lib/api';
import { countdown, formatAmount } from '@/lib/format';
import { CheckIcon, CopyIcon } from './icons';

interface TransferPanelProps {
  account: TransferAccount;
  onExpired: () => void;
}

function Copyable({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-line-soft last:border-0">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted">{label}</p>
        <p
          className={`text-[15px] font-semibold text-ink mt-0.5 ${
            mono ? 'font-mono tracking-[0.06em] text-[17px]' : ''
          }`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-semibold transition-colors ${
          copied ? 'bg-[#E9F7EF] text-success' : 'bg-canvas text-body hover:text-ink hover:bg-line-soft'
        }`}
        aria-live="polite"
      >
        {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        {copied ? 'Copied' : 'Copy'}
        <span className="sr-only"> {label}</span>
      </button>
    </div>
  );
}

export function TransferPanel({ account, onExpired }: TransferPanelProps) {
  const [remaining, setRemaining] = useState(
    () => new Date(account.expiresAt).getTime() - Date.now(),
  );
  const total = Math.max(1, new Date(account.expiresAt).getTime() - Date.now() + remaining);

  useEffect(() => {
    const tick = () => {
      const next = new Date(account.expiresAt).getTime() - Date.now();
      setRemaining(next);
      if (next <= 0) onExpired();
    };
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [account.expiresAt, onExpired]);

  const fraction = Math.max(0, Math.min(1, remaining / total));

  return (
    <div className="animate-rise">
      <h2 className="text-[20px] font-extrabold tracking-[-0.02em]">Transfer to this account</h2>
      <p className="mt-1 text-[13px] text-body">
        Send the exact amount from your bank app. We confirm it the moment your bank releases it.
      </p>

      <div className="mt-5 rounded-card border border-line bg-surface px-5 shadow-card">
        <Copyable label="Bank" value={account.bankName} />
        <Copyable label="Account number" value={account.accountNumber} mono />
        <Copyable label="Account name" value={account.accountName} />
        <Copyable label="Exact amount" value={formatAmount(account.amountMinor, account.currency)} />
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-control border border-line bg-surface px-4 py-3">
        <span className="relative grid place-items-center w-9 h-9 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E9EE" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${fraction * 97.4} 97.4`}
              className="transition-[stroke-dasharray] duration-1000 ease-linear"
            />
          </svg>
          <span className="w-2 h-2 rounded-full animate-breathe" style={{ background: 'var(--accent)' }} />
        </span>
        <div className="min-w-0 flex-1" role="status">
          <p className="text-[14px] font-semibold">
            {remaining > 0 ? 'Listening for your transfer' : 'This account has expired'}
          </p>
          <p className="text-[12px] text-body tabular" role="timer" aria-live="off">
            {remaining > 0
              ? `Account closes in ${countdown(remaining)}`
              : 'Choose a method again to get a fresh account.'}
          </p>
        </div>
      </div>
    </div>
  );
}
