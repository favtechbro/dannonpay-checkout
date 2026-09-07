import { useEffect, useId, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiError, checkoutApi, type PaymentLinkView } from '@/lib/api';
import { formatAmount } from '@/lib/format';
import { CheckoutShell } from '@/components/CheckoutShell';
import { EmptyState } from '@/components/EmptyState';
import { MethodSkeleton } from '@/components/Skeleton';
import { ChevronIcon, Spinner } from '@/components/icons';

export function PaymentLinkPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const amountId = useId();
  const errorId = useId();

  const [link, setLink] = useState<PaymentLinkView | null>(null);
  const [loadError, setLoadError] = useState<{ title: string; detail: string } | null>(null);
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
        document.title = `${view.title} · ${view.merchantName}`;
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoadError(
          cause instanceof ApiError && cause.status === 404
            ? { title: 'We could not find this link', detail: 'It may have been removed or typed incorrectly.' }
            : { title: 'We could not load this link', detail: 'Please check your connection and try again.' },
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
      setError('Enter your name and email so the merchant can send your receipt.');
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

  if (loadError) return <EmptyState title={loadError.title} detail={loadError.detail} />;

  if (!link) {
    return (
      <CheckoutShell
        merchant={{ name: ' ', logoUrl: null }}
        amountMinor="0"
        currency="   "
        description={null}
        embedded={false}
      >
        <MethodSkeleton />
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell
      merchant={{ name: link.merchantName, logoUrl: link.merchantLogoUrl }}
      amountMinor={link.amountMinor ?? '0'}
      currency={link.currency}
      description={link.title}
      embedded={false}
    >
      {!link.acceptingPayments ? (
        <div role="status" className="rounded-card border border-line bg-surface p-6 animate-rise">
          <p className="text-[15px] font-semibold">This link is not taking payments</p>
          <p className="mt-1 text-[13px] text-body">
            {link.unavailableReason ?? 'Ask the merchant for a new one.'}
          </p>
        </div>
      ) : (
        <form onSubmit={(event) => void submit(event)} noValidate className="animate-rise">
          <h2 className="text-[20px] font-extrabold tracking-[-0.02em]">Your details</h2>
          <p className="mt-1 text-[13px] text-body">
            {link.description ?? 'We only use these to send your receipt.'}
          </p>

          <div className="mt-5 space-y-4">
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

            <div>
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
              <div>
                <label className="field-label" htmlFor={phoneId}>
                  Phone number
                </label>
                <input
                  id={phoneId}
                  className="field-input tabular"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            )}

            {!link.amountMinor && (
              <div>
                <label className="field-label" htmlFor={amountId}>
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 grid place-items-center text-[14px] font-semibold text-muted">
                    {link.currency}
                  </span>
                  <input
                    id={amountId}
                    className="field-input tabular pl-16"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </div>
                {(link.minAmountMinor || link.maxAmountMinor) && (
                  <p className="mt-2 text-[12px] text-muted">
                    {link.minAmountMinor && `From ${formatAmount(link.minAmountMinor, link.currency)}`}
                    {link.minAmountMinor && link.maxAmountMinor && ' · '}
                    {link.maxAmountMinor && `Up to ${formatAmount(link.maxAmountMinor, link.currency)}`}
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p id={errorId} role="alert" className="mt-4 text-[13px] font-medium text-danger">
              {error}
            </p>
          )}

          <button type="submit" className="primary-button mt-6" disabled={busy}>
            <span className="inline-flex items-center justify-center gap-2">
              {busy ? <Spinner size={18} /> : null}
              {busy ? 'Opening checkout' : 'Continue to payment'}
              {!busy && <ChevronIcon size={16} />}
            </span>
          </button>
        </form>
      )}
    </CheckoutShell>
  );
}
