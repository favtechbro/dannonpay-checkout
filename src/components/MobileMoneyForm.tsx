import { useId, useState } from 'react';
import type { MobileMoneyNetwork } from '@/lib/api';
import { BackIcon, Spinner } from './icons';

interface MobileMoneyFormProps {
  networks: MobileMoneyNetwork[];
  busy: boolean;
  onSubmit: (network: string, phone: string) => void;
  onBack: () => void;
}

const PHONE_SHAPE = /^\+?[0-9][0-9\s-]{6,18}$/;

export function MobileMoneyForm({ networks, busy, onSubmit, onBack }: MobileMoneyFormProps) {
  const groupId = useId();
  const phoneId = useId();
  const errorId = useId();
  const [network, setNetwork] = useState(networks[0]?.code ?? '');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!PHONE_SHAPE.test(phone.trim())) {
      setError('Enter the number your mobile money wallet is registered to.');
      return;
    }
    setError(null);
    onSubmit(network, phone.trim());
  };

  return (
    <form onSubmit={submit} noValidate className="animate-rise">
      <button type="button" onClick={onBack} className="text-button -ml-3 mb-2">
        <BackIcon size={16} />
        All methods
      </button>
      <h2 className="text-[20px] font-extrabold tracking-[-0.02em]">Pay with mobile money</h2>
      <p className="mt-1 text-[13px] text-body">
        We send a prompt to your phone. Approve it with your wallet PIN to finish.
      </p>

      <fieldset className="mt-5 border-0 p-0 m-0">
        <legend id={groupId} className="field-label">
          Network
        </legend>
        <div
          role="radiogroup"
          aria-labelledby={groupId}
          className={`grid gap-2 ${networks.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}
        >
          {networks.map((item) => {
            const checked = network === item.code;
            return (
              <label
                key={item.code}
                className={`flex items-center justify-center h-12 px-3 rounded-control border text-[13px] font-semibold text-center cursor-pointer transition-[border-color,box-shadow,color] ${
                  checked ? 'text-accent shadow-ring' : 'border-line text-body hover:border-[#CBD2DA]'
                }`}
                style={checked ? { borderColor: 'var(--accent)' } : undefined}
              >
                <input
                  type="radio"
                  name="network"
                  value={item.code}
                  checked={checked}
                  onChange={() => setNetwork(item.code)}
                  className="sr-only"
                />
                {item.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5">
        <label className="field-label" htmlFor={phoneId}>
          Phone number
        </label>
        <input
          id={phoneId}
          className="field-input tabular"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+233 20 123 4567"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {error && (
          <p id={errorId} className="mt-2 text-[13px] font-medium text-danger">
            {error}
          </p>
        )}
      </div>

      <button type="submit" className="primary-button mt-6" disabled={busy}>
        <span className="inline-flex items-center justify-center gap-2">
          {busy && <Spinner size={18} />}
          {busy ? 'Sending the prompt' : 'Send payment prompt'}
        </span>
      </button>
    </form>
  );
}
