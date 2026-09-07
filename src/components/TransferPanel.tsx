import { useEffect, useState } from 'react';
import type { TransferAccount } from '@/lib/api';
import { countdown, formatAmount } from '@/lib/format';

interface TransferPanelProps {
  account: TransferAccount;
  onExpired: () => void;
}

interface CopyableProps {
  label: string;
  value: string;
  mono?: boolean;
}

function Copyable({ label, value, mono }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
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
    <div className="flex items-center justify-between gap-3 py-3 border-b border-line last:border-0">
      <div className="min-w-0">
        <p className="text-[12px] text-muted">{label}</p>
        <p
          className={`text-[15px] font-medium ${mono ? 'font-mono tracking-wide' : ''}`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="quiet-button shrink-0 h-9 px-3 text-[13px]"
      >
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

  useEffect(() => {
    const tick = () => {
      const next = new Date(account.expiresAt).getTime() - Date.now();
      setRemaining(next);
      if (next <= 0) onExpired();
    };
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [account.expiresAt, onExpired]);

  return (
    <div>
      <h2 className="text-[15px] font-semibold">Transfer to this account</h2>
      <p className="text-[13px] text-muted mt-1">
        Send the exact amount. We confirm the payment automatically once your
        bank releases it.
      </p>

      <div className="mt-4 rounded-xl border border-line px-4">
        <Copyable label="Bank" value={account.bankName} />
        <Copyable label="Account number" value={account.accountNumber} mono />
        <Copyable label="Account name" value={account.accountName} />
        <Copyable
          label="Exact amount"
          value={formatAmount(account.amountMinor, account.currency)}
        />
      </div>

      <p
        className="mt-4 text-[13px] text-muted"
        role="timer"
        aria-live="off"
      >
        {remaining > 0 ? (
          <>
            This account expires in{' '}
            <span className="font-medium text-ink">{countdown(remaining)}</span>
          </>
        ) : (
          'This account has expired. Start again to get a new one.'
        )}
      </p>

      <p
        className="mt-4 flex items-center gap-2 text-[14px] text-muted"
        role="status"
      >
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: 'var(--brand)' }}
        />
        Waiting for your transfer…
      </p>
    </div>
  );
}
