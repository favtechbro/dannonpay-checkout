import { useId, useState } from 'react';
import type { CheckoutMethod, PaymentChannel } from '@/lib/api';
import { METHOD_HINT, METHOD_LABEL } from '@/lib/format';

interface MethodSelectorProps {
  methods: CheckoutMethod[];
  busy: boolean;
  onChoose: (channel: PaymentChannel) => void;
}

export function MethodSelector({
  methods,
  busy,
  onChoose,
}: MethodSelectorProps) {
  const groupId = useId();
  const [selected, setSelected] = useState<PaymentChannel | null>(
    methods[0]?.channel ?? null,
  );

  if (methods.length === 0) {
    return (
      <p role="status" className="text-[14px] text-muted">
        No payment method is available for this payment right now. Please try
        again shortly.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (selected) onChoose(selected);
      }}
    >
      <fieldset className="border-0 p-0 m-0">
        <legend
          id={groupId}
          className="text-[15px] font-semibold mb-3 px-0"
        >
          How would you like to pay?
        </legend>

        <div className="space-y-2.5" role="radiogroup" aria-labelledby={groupId}>
          {methods.map((method) => {
            const checked = selected === method.channel;
            return (
              <label
                key={method.channel}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  checked ? 'bg-canvas' : 'border-line hover:bg-canvas/60'
                }`}
                style={checked ? { borderColor: 'var(--brand)' } : undefined}
              >
                <input
                  type="radio"
                  name="method"
                  value={method.channel}
                  checked={checked}
                  onChange={() => setSelected(method.channel)}
                  className="w-4 h-4 accent-[var(--brand)]"
                />
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium">
                    {METHOD_LABEL[method.channel] ?? method.channel}
                  </span>
                  <span className="block text-[13px] text-muted">
                    {METHOD_HINT[method.channel] ?? ''}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button type="submit" className="primary-button mt-5" disabled={busy}>
        {busy ? 'Starting…' : 'Continue'}
      </button>
    </form>
  );
}
