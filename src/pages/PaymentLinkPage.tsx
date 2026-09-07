import { useEffect, useId, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiError, checkoutApi, type PaymentLinkView } from '@/lib/api';
import { formatAmount } from '@/lib/format';

export function PaymentLinkPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const amountId = useId();
  const errorId = useId();

  const [link, setLink] = useState<PaymentLinkView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkoutApi
      .link(slug)
      .then((view) => {
        if (cancelled) return;
        setLink(view);
        document.title = view.title;
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoadError(
          cause instanceof ApiError && cause.status === 404
            ? 'We could not find this payment link.'
            : 'We could not load this payment link.',
        );
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!link) return;
    if (!name.trim() || !email.trim()) {
      setError('Enter your name and email so the merchant can reach you.');
      return;
    }
    if (!link.amountMinor && !amount.trim()) {
      setError('Enter the amount you want to pay.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const session = await checkoutApi.startLinkSession(slug, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        amount: link.amountMinor ? undefined : amount.trim(),
      });
      window.location.assign(session.checkoutUrl);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'We could not start this payment. Please try again.',
      );
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center bg-canvas px-4">
        <div className="max-w-[420px] text-center">
          <h1 className="text-[18px] font-semibold">Link unavailable</h1>
          <p className="mt-2 text-[14px] text-muted">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen grid place-items-center bg-canvas">
        <p role="status" className="text-[14px] text-muted">
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex items-start justify-center px-4 py-6 sm:py-12">
      <main className="w-full max-w-[460px] rounded-2xl bg-surface border border-line shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.18)] overflow-hidden">
        <header className="px-5 sm:px-6 pt-6 pb-5 border-b border-line">
          <div className="flex items-center gap-3">
            {link.merchantLogoUrl ? (
              <img
                src={link.merchantLogoUrl}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-line"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-[13px] text-muted">{link.merchantName}</p>
              <h1 className="text-[18px] font-semibold truncate">
                {link.title}
              </h1>
            </div>
          </div>
          {link.description && (
            <p className="mt-3 text-[14px] text-muted">{link.description}</p>
          )}
          {link.amountMinor && (
            <p className="mt-3 text-[24px] font-bold tracking-tight">
              {formatAmount(link.amountMinor, link.currency)}
            </p>
          )}
        </header>

        <div className="px-5 sm:px-6 py-6">
          {!link.acceptingPayments ? (
            <p role="status" className="text-[14px] text-muted">
              {link.unavailableReason ??
                'This link is not accepting payments right now.'}
            </p>
          ) : (
            <form onSubmit={(event) => void submit(event)} noValidate>
              <div>
                <label className="field-label" htmlFor={nameId}>
                  Full name
                </label>
                <input
                  id={nameId}
                  className="field-input"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="field-label" htmlFor={emailId}>
                  Email
                </label>
                <input
                  id={emailId}
                  className="field-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {link.collectPhone && (
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
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              )}

              {!link.amountMinor && (
                <div className="mt-4">
                  <label className="field-label" htmlFor={amountId}>
                    Amount ({link.currency})
                  </label>
                  <input
                    id={amountId}
                    className="field-input"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  {link.minAmountMinor && (
                    <p className="mt-1.5 text-[13px] text-muted">
                      Minimum {formatAmount(link.minAmountMinor, link.currency)}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p id={errorId} role="alert" className="mt-4 text-[13px] text-danger">
                  {error}
                </p>
              )}

              <button type="submit" className="primary-button mt-5" disabled={busy}>
                {busy ? 'Opening checkout…' : 'Continue to payment'}
              </button>
            </form>
          )}
        </div>

        <footer className="px-5 sm:px-6 pb-6">
          <p className="text-[12px] text-muted text-center">
            Secured by Dannon Pay
          </p>
        </footer>
      </main>
    </div>
  );
}
