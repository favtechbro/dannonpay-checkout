import { BrandLockup } from './BrandLockup';

interface EmptyStateProps {
  title: string;
  detail: string;
}

export function EmptyState({ title, detail }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-card bg-surface border border-line shadow-card px-8 py-10 text-center animate-rise">
        <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-ice text-blue">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4.5M12 16h.01" />
          </svg>
        </span>
        <h1 className="mt-5 text-[20px] font-extrabold tracking-[-0.02em]">{title}</h1>
        <p className="mt-2 text-[14px] text-body">{detail}</p>
      </div>
      <div className="mt-8">
        <BrandLockup size="sm" />
      </div>
    </div>
  );
}
