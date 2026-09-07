import { useEffect, useId, useState } from 'react';
import { checkoutApi, type CardDetails, type TestCards } from '@/lib/api';
import { BackIcon, CardIcon, LockIcon, Spinner } from './icons';

interface CardFormProps {
  busy: boolean;
  onSubmit: (card: CardDetails) => void;
  onBack: () => void;
}

function groupDigits(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/**
 * Card entry on our own page. This only appears when the sandbox provider is
 * taking the payment, so every number typed here is a test card.
 */
export function CardForm({ busy, onSubmit, onBack }: CardFormProps) {
  const numberId = useId();
  const expiryId = useId();
  const cvvId = useId();
  const errorId = useId();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testCards, setTestCards] = useState<TestCards | null>(null);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkoutApi
      .testCards()
      .then((cards) => {
        if (!cancelled) setTestCards(cards);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const digits = number.replace(/\D/g, '');
    const [month, year] = expiry.split('/');
    if (digits.length < 12) {
      setError('Enter the full card number.');
      return;
    }
    if (!month || !year || year.length !== 2) {
      setError('Enter the expiry as MM/YY.');
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError('Enter the three digits on the back of the card.');
      return;
    }
    setError(null);
    onSubmit({ number: digits, cvv, expiryMonth: month, expiryYear: `20${year}` });
  };

  const fillCard = (value: string) => {
    setNumber(groupDigits(value));
    setExpiry('12/31');
    setCvv('123');
    setShowCards(false);
  };

  return (
    <form onSubmit={submit} noValidate className="animate-rise">
      <button type="button" onClick={onBack} className="text-button -ml-3 mb-2">
        <BackIcon size={16} />
        All methods
      </button>
      <h2 className="text-[20px] font-extrabold tracking-[-0.02em]">Pay with card</h2>
      <p className="mt-1 text-[13px] text-body">
        Your details are encrypted and never stored.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-control border border-[#FDE7C7] bg-[#FFF7EA] px-4 py-3">
        <span className="mt-0.5 shrink-0 rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-warning">
          Sandbox
        </span>
        <p className="text-[13px] text-body">
          No real card is charged here. Use a test card to choose the outcome.{' '}
          {testCards && (
            <button
              type="button"
              onClick={() => setShowCards((open) => !open)}
              className="font-semibold text-ink underline underline-offset-2"
              aria-expanded={showCards}
            >
              {showCards ? 'Hide test cards' : 'Show test cards'}
            </button>
          )}
        </p>
      </div>

      {showCards && testCards && (
        <ul className="mt-3 divide-y divide-line-soft rounded-control border border-line bg-surface">
          {testCards.cards.map((card) => (
            <li key={card.number}>
              <button
                type="button"
                onClick={() => fillCard(card.number)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-canvas"
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold">{card.title}</span>
                  <span className="block truncate text-[12px] text-muted">{card.detail}</span>
                </span>
                <code className="shrink-0 text-[12px] text-body">{groupDigits(card.number)}</code>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        <label className="field-label" htmlFor={numberId}>
          Card number
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-4 grid place-items-center text-muted">
            <CardIcon size={20} />
          </span>
          <input
            id={numberId}
            className="field-input tabular pl-12"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={number}
            onChange={(event) => setNumber(groupDigits(event.target.value))}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor={expiryId}>
            Expiry
          </label>
          <input
            id={expiryId}
            className="field-input tabular"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={expiry}
            onChange={(event) => setExpiry(formatExpiry(event.target.value))}
          />
        </div>
        <div>
          <label className="field-label" htmlFor={cvvId}>
            CVV
          </label>
          <input
            id={cvvId}
            className="field-input tabular"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            value={cvv}
            onChange={(event) => setCvv(event.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}

      <button type="submit" className="primary-button mt-6" disabled={busy}>
        <span className="inline-flex items-center justify-center gap-2">
          {busy ? <Spinner size={18} /> : <LockIcon size={15} />}
          {busy ? 'Charging your card' : 'Pay now'}
        </span>
      </button>
    </form>
  );
}
