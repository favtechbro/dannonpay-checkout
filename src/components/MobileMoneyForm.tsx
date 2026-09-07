import { useId, useState } from 'react';
import type { MobileMoneyNetwork } from '@/lib/api';

interface MobileMoneyFormProps {
  networks: MobileMoneyNetwork[];
  busy: boolean;
  onSubmit: (network: string, phone: string) => void;
  onBack: () => void;
}

const PHONE_SHAPE = /^\+?[0-9][0-9\s-]{6,18}$/;

export function MobileMoneyForm({
  networks,
  busy,
  onSubmit,
  onBack,
}: MobileMoneyFormProps) {
  const networkId = useId();
  const phoneId = useId();
  const errorId = useId();
  const [network, setNetwork] = useState(networks[0]?.code ?? '');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!PHONE_SHAPE.test(phone.trim())) {
      setError('Enter the phone number your mobile money wallet is on.');
      return;
    }
    setError(null);
    onSubmit(network, phone.trim());
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-[15px] font-semibold">Pay with mobile money</h2>

      <div className="mt-4">
        <label className="field-label" htmlFor={networkId}>
          Network
        </label>
        <select
          id={networkId}
          className="field-input"
          value={network}
          onChange={(event) => setNetwork(event.target.value)}
        >
          {networks.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="field-label" htmlFor={phoneId}>
          Phone number
        </label>
        <input
          id={phoneId}
          className="field-input"
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
          <p id={errorId} className="mt-1.5 text-[13px] text-danger">
            {error}
          </p>
        )}
      </div>

      <button type="submit" className="primary-button mt-5" disabled={busy}>
        {busy ? 'Sending prompt…' : 'Send payment prompt'}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full mt-3 h-11 text-[14px] font-medium text-muted hover:text-ink"
      >
        Choose another method
      </button>
    </form>
  );
}
