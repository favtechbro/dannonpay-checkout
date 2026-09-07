interface StatusPanelProps {
  tone: 'pending' | 'success' | 'failed';
  headline: string;
  detail: string;
  reference?: string | null;
  action?: { label: string; onClick: () => void };
}

function Badge({ tone }: { tone: StatusPanelProps['tone'] }) {
  if (tone === 'success') {
    return (
      <span className="grid place-items-center w-20 h-20 rounded-full bg-[#E9F7EF] text-success animate-pop">
        <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
          <path
            d="m15 24.5 6.5 6.5L33 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="30"
            strokeDashoffset="30"
            className="animate-draw"
          />
        </svg>
      </span>
    );
  }
  if (tone === 'failed') {
    return (
      <span className="grid place-items-center w-20 h-20 rounded-full bg-[#FBEAEA] text-danger animate-pop">
        <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
          <path d="M17 17l14 14M31 17 17 31" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="relative grid place-items-center w-20 h-20 rounded-full bg-canvas text-accent">
      <svg viewBox="0 0 48 48" width="44" height="44" className="animate-spin" style={{ animationDuration: '1.4s' }} aria-hidden="true">
        <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.15" />
        <path d="M43 24a19 19 0 0 0-19-19" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function StatusPanel({ tone, headline, detail, reference, action }: StatusPanelProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 animate-rise" role="status" aria-live="polite">
      <Badge tone={tone} />
      <h2 className="mt-6 text-[22px] font-extrabold tracking-[-0.02em]">{headline}</h2>
      <p className="mt-2 max-w-[320px] text-[14px] text-body">{detail}</p>
      {reference && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-canvas px-3.5 py-1.5 text-[12px] font-medium text-body">
          <span className="text-muted">Ref</span>
          <span className="font-mono tracking-[0.04em] text-ink">{reference}</span>
        </p>
      )}
      {action && (
        <button type="button" onClick={action.onClick} className="quiet-button mt-6">
          {action.label}
        </button>
      )}
    </div>
  );
}
