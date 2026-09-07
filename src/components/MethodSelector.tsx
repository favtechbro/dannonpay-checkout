import { useId, useState } from 'react';
import type { CheckoutMethod, PaymentChannel } from '@/lib/api';
import { METHOD_HINT, METHOD_LABEL } from '@/lib/format';
import { BankIcon, CardIcon, ChevronIcon, PhoneIcon, Spinner } from './icons';

interface MethodSelectorProps {
  methods: CheckoutMethod[];
  busy: boolean;
  onChoose: (channel: PaymentChannel) => void;
}

const ICONS: Record<string, typeof CardIcon> = {
  card: CardIcon,
  bank_transfer: BankIcon,
  mobile_money: PhoneIcon,
  bank_account: BankIcon,
};

export function MethodSelector({ methods, busy, onChoose }: MethodSelectorProps) {
  const groupId = useId();
  const [selected, setSelected] = useState<PaymentChannel | null>(
    methods[0]?.channel ?? null,
  );

  if (methods.length === 0) {
    return (
      <div role="status" className="rounded-card border border-line bg-surface p-6 text-center">
        <p className="text-[15px] font-semibold">No way to pay just now</p>
        <p className="mt-1 text-[13px] text-body">
          None of the payment methods for this currency are available at the moment. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      className="animate-rise"
      onSubmit={(event) => {
        event.preventDefault();
        if (selected) onChoose(selected);
      }}
    >
      <fieldset className="border-0 p-0 m-0 min-w-0">
        <legend id={groupId} className="text-[20px] font-extrabold tracking-[-0.02em] mb-1">
          How would you like to pay?
        </legend>
        <p className="text-[13px] text-body mb-5">
          Only methods that can complete this payment are shown.
        </p>

        <div className="space-y-3" role="radiogroup" aria-labelledby={groupId}>
          {methods.map((method) => {
            const checked = selected === method.channel;
            const Icon = ICONS[method.channel] ?? CardIcon;
            return (
              <label
                key={method.channel}
                className={`group relative flex items-center gap-4 p-4 rounded-control border bg-surface cursor-pointer transition-[border-color,box-shadow,background-color] duration-150 ${
                  checked ? 'shadow-ring' : 'border-line hover:border-[#CBD2DA]'
                }`}
                style={checked ? { borderColor: 'var(--accent)' } : undefined}
              >
                <input
                  type="radio"
                  name="method"
                  value={method.channel}
                  checked={checked}
                  onChange={() => setSelected(method.channel)}
                  className="sr-only"
                />
                <span
                  className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 transition-colors ${
                    checked ? 'text-accent' : 'bg-canvas text-body group-hover:text-ink'
                  }`}
                  style={checked ? { background: 'var(--accent-soft)' } : undefined}
                >
                  <Icon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">
                    {METHOD_LABEL[method.channel] ?? method.channel}
                  </span>
                  <span className="block text-[13px] text-body">
                    {METHOD_HINT[method.channel] ?? ''}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid place-items-center w-5 h-5 rounded-full border-2 transition-colors ${
                    checked ? 'border-transparent' : 'border-line'
                  }`}
                  style={checked ? { background: 'var(--accent)' } : undefined}
                >
                  {checked && <span className="w-2 h-2 rounded-full bg-white" />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button type="submit" className="primary-button mt-6" disabled={busy || !selected}>
        <span className="inline-flex items-center justify-center gap-2">
          {busy ? <Spinner size={18} /> : null}
          {busy ? 'Starting your payment' : 'Continue'}
          {!busy && <ChevronIcon size={16} />}
        </span>
      </button>
    </form>
  );
}
