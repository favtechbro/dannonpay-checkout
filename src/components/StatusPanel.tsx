interface StatusPanelProps {
  tone: 'pending' | 'success' | 'failed';
  headline: string;
  detail: string;
  reference?: string | null;
  action?: { label: string; onClick: () => void };
}

const ICON: Record<StatusPanelProps['tone'], JSX.Element> = {
  pending: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        d="m5 12.5 4.5 4.5L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  failed: (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        d="M7 7l10 10M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const TONE_CLASS: Record<StatusPanelProps['tone'], string> = {
  pending: 'text-muted',
  success: 'text-success',
  failed: 'text-danger',
};

export function StatusPanel({
  tone,
  headline,
  detail,
  reference,
  action,
}: StatusPanelProps) {
  return (
    <div className="text-center py-4" role="status" aria-live="polite">
      <span
        className={`inline-grid place-items-center w-14 h-14 rounded-full bg-canvas ${TONE_CLASS[tone]} ${
          tone === 'pending' ? 'animate-pulse' : ''
        }`}
      >
        {ICON[tone]}
      </span>
      <h2 className="mt-4 text-[18px] font-semibold">{headline}</h2>
      <p className="mt-1.5 text-[14px] text-muted">{detail}</p>
      {reference && (
        <p className="mt-4 text-[12px] font-mono text-muted break-all">
          {reference}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="quiet-button mt-5"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
