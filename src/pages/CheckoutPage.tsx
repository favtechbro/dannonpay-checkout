import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ApiError,
  checkoutApi,
  type CheckoutSessionView,
  type ChosenMethod,
  type NextAction,
  type PaymentChannel,
} from '@/lib/api';
import { applyBrandColor } from '@/lib/theme';
import { bridge, isEmbedded } from '@/lib/bridge';
import { useSessionStatus } from '@/hooks/useSessionStatus';
import { CheckoutShell } from '@/components/CheckoutShell';
import { MethodSelector } from '@/components/MethodSelector';
import { TransferPanel } from '@/components/TransferPanel';
import { MobileMoneyForm } from '@/components/MobileMoneyForm';
import { CardForm } from '@/components/CardForm';
import { AuthPrompt } from '@/components/AuthPrompt';
import { StatusPanel } from '@/components/StatusPanel';
import { MethodSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';

type Stage =
  | { name: 'loading' }
  | { name: 'unavailable'; title: string; detail: string }
  | { name: 'choosing' }
  | { name: 'mobile-money' }
  | { name: 'card' }
  | { name: 'acting'; action: NextAction }
  | { name: 'confirming' }
  | { name: 'settled'; tone: 'success' | 'failed'; headline: string; detail: string };

const REDIRECT_DELAY_MS = 1400;
const EXPIRED = {
  title: 'This payment page has expired',
  detail: 'Ask the merchant for a fresh link and try again.',
};

interface CheckoutPageProps {
  mode: 'hosted' | 'embedded';
}

export function CheckoutPage({ mode }: CheckoutPageProps) {
  const { code = '' } = useParams<{ code: string }>();
  const embedded = mode === 'embedded' || isEmbedded();

  const [session, setSession] = useState<CheckoutSessionView | null>(null);
  const [stage, setStage] = useState<Stage>({ name: 'loading' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const announcedSuccess = useRef(false);

  const watching =
    stage.name === 'acting' ||
    stage.name === 'confirming' ||
    stage.name === 'choosing' ||
    stage.name === 'mobile-money' ||
    stage.name === 'card';
  const liveStatus = useSessionStatus(code, watching);

  useEffect(() => {
    let cancelled = false;
    checkoutApi
      .view(code)
      .then((view) => {
        if (cancelled) return;
        setSession(view);
        applyBrandColor(view.merchant.brandColor);
        document.title = `Pay ${view.merchant.name} · Dannon Pay`;
        if (view.status === 'completed') {
          setStage({
            name: 'settled',
            tone: 'success',
            headline: 'Payment received',
            detail: 'This payment has already been completed.',
          });
          return;
        }
        if (view.status === 'expired') {
          setStage({ name: 'unavailable', ...EXPIRED });
          return;
        }
        if (view.status === 'abandoned') {
          setStage({
            name: 'unavailable',
            title: 'This payment was cancelled',
            detail: 'Start again from the merchant if you still want to pay.',
          });
          return;
        }
        if (view.status === 'processing' && view.nextAction.kind !== 'none') {
          setStage({ name: 'acting', action: view.nextAction });
          return;
        }
        setStage({ name: 'choosing' });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStage({
          name: 'unavailable',
          title:
            error instanceof ApiError && error.status === 404
              ? 'We could not find this payment'
              : 'We could not load this payment',
          detail:
            error instanceof ApiError && error.status === 404
              ? 'The link may be incomplete or no longer valid.'
              : 'Please check your connection and try again.',
        });
        bridge.error('session_unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    bridge.ready();
  }, []);

  useEffect(() => {
    if (!embedded) return;
    const report = () => bridge.resize(document.body.scrollHeight + 8);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [embedded, stage]);

  useEffect(() => {
    stageRef.current?.focus();
  }, [stage.name]);

  // The page never decides an outcome for itself: it renders whatever the
  // server last confirmed.
  useEffect(() => {
    if (!liveStatus) return;
    if (liveStatus.status === 'completed' || liveStatus.paymentStatus === 'SUCCEEDED') {
      setStage({
        name: 'settled',
        tone: 'success',
        headline: 'Payment received',
        detail: 'Thank you. Your payment is confirmed and a receipt is on its way.',
      });
      if (!announcedSuccess.current && liveStatus.reference) {
        announcedSuccess.current = true;
        bridge.success(liveStatus.reference);
        if (!embedded && liveStatus.successUrl) {
          const target = liveStatus.successUrl;
          window.setTimeout(() => window.location.assign(target), REDIRECT_DELAY_MS);
        }
      }
      return;
    }
    if (liveStatus.status === 'expired') {
      setStage({ name: 'unavailable', ...EXPIRED });
      return;
    }
    if (liveStatus.paymentStatus === 'FAILED' || liveStatus.paymentStatus === 'ABANDONED') {
      setStage({
        name: 'settled',
        tone: 'failed',
        headline: 'Payment not completed',
        detail: 'Nothing was charged. You can try again with another method.',
      });
      return;
    }
    if (liveStatus.nextAction.kind.startsWith('send_')) {
      setStage((current) =>
        current.name === 'acting' && current.action.kind === liveStatus.nextAction.kind
          ? current
          : { name: 'acting', action: liveStatus.nextAction },
      );
    }
  }, [liveStatus, embedded]);

  const applyAction = useCallback((action: NextAction) => {
    if (action.kind === 'open_url' && action.url) {
      window.location.assign(action.url);
      return;
    }
    if (action.kind === 'none') {
      setStage({ name: 'confirming' });
      return;
    }
    setStage({ name: 'acting', action });
  }, []);

  const startMethod = useCallback(
    async (method: ChosenMethod) => {
      setBusy(true);
      setNotice(null);
      try {
        const charge = await checkoutApi.pay(code, { method });
        applyAction(charge.nextAction);
      } catch (error) {
        setNotice(
          error instanceof ApiError
            ? error.message
            : 'We could not start that payment. Please try another method.',
        );
      } finally {
        setBusy(false);
      }
    },
    [applyAction, code],
  );

  const choose = useCallback(
    (channel: PaymentChannel) => {
      if (channel === 'mobile_money') {
        setStage({ name: 'mobile-money' });
        return;
      }
      const inlineCard =
        channel === 'card' &&
        session?.methods.find((m) => m.channel === 'card')?.entry === 'inline';
      if (inlineCard) {
        setStage({ name: 'card' });
        return;
      }
      void startMethod({ type: channel as ChosenMethod['type'] });
    },
    [session, startMethod],
  );

  const submitValue = useCallback(
    async (field: string, value: string) => {
      setBusy(true);
      setNotice(null);
      try {
        const charge = await checkoutApi.submit(code, field, value);
        applyAction(charge.nextAction);
      } catch (error) {
        setNotice(
          error instanceof ApiError
            ? error.message
            : 'That value was not accepted. Please try again.',
        );
      } finally {
        setBusy(false);
      }
    },
    [applyAction, code],
  );

  const close = useCallback(() => {
    void checkoutApi.cancel(code).catch(() => undefined);
    bridge.close();
    if (!embedded && session?.cancelUrl) {
      window.location.assign(session.cancelUrl);
    }
  }, [code, embedded, session?.cancelUrl]);

  if (stage.name === 'unavailable') {
    return <EmptyState title={stage.title} detail={stage.detail} />;
  }

  if (stage.name === 'loading' || !session) {
    return (
      <CheckoutShell
        merchant={{ name: ' ', logoUrl: null }}
        amountMinor="0"
        currency="   "
        description={null}
        embedded={embedded}
      >
        <p className="sr-only" role="status">
          Loading your payment
        </p>
        <MethodSkeleton />
      </CheckoutShell>
    );
  }

  const networks = session.methods.find((m) => m.channel === 'mobile_money')?.networks ?? [];

  return (
    <CheckoutShell
      merchant={session.merchant}
      amountMinor={session.amountMinor}
      currency={session.currency}
      description={session.description}
      customerEmail={session.customerEmail}
      embedded={embedded}
      onClose={close}
    >
      <div ref={stageRef} tabIndex={-1} className="outline-none">
        {notice && (
          <p
            role="alert"
            className="mb-5 flex gap-3 rounded-control border border-danger/20 bg-[#FBEAEA] px-4 py-3 text-[13px] font-medium text-danger animate-rise"
          >
            <span aria-hidden="true" className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-danger text-white text-[11px] font-bold grid place-items-center">
              !
            </span>
            {notice}
          </p>
        )}

        {stage.name === 'choosing' && (
          <MethodSelector methods={session.methods} busy={busy} onChoose={choose} />
        )}

        {stage.name === 'card' && (
          <CardForm
            busy={busy}
            onSubmit={(card) => void startMethod({ type: 'card', card })}
            onBack={() => setStage({ name: 'choosing' })}
          />
        )}

        {stage.name === 'mobile-money' && (
          <MobileMoneyForm
            networks={networks}
            busy={busy}
            onSubmit={(network, phone) =>
              void startMethod({ type: 'mobile_money', mobileMoney: { network, phone } })
            }
            onBack={() => setStage({ name: 'choosing' })}
          />
        )}

        {stage.name === 'acting' && stage.action.kind === 'display_account' && stage.action.account && (
          <TransferPanel
            account={stage.action.account}
            onExpired={() => setStage({ name: 'choosing' })}
          />
        )}

        {stage.name === 'acting' && stage.action.kind === 'pay_offline' && (
          <StatusPanel
            tone="pending"
            headline="Approve on your phone"
            detail={stage.action.displayText ?? 'A prompt is on its way. Approve it with your wallet PIN to finish.'}
          />
        )}

        {stage.name === 'confirming' && (
          <StatusPanel
            tone="pending"
            headline="Confirming your payment"
            detail="Your bank is releasing the payment. This usually takes a few seconds."
          />
        )}

        {stage.name === 'acting' && stage.action.kind.startsWith('send_') && stage.action.field && (
          <AuthPrompt
            field={stage.action.field}
            displayText={stage.action.displayText}
            busy={busy}
            onSubmit={(value) => void submitValue(stage.action.field!, value)}
          />
        )}

        {stage.name === 'settled' && (
          <StatusPanel
            tone={stage.tone}
            headline={stage.headline}
            detail={stage.detail}
            reference={liveStatus?.reference ?? session.reference}
            action={
              stage.tone === 'failed'
                ? { label: 'Try again', onClick: () => setStage({ name: 'choosing' }) }
                : undefined
            }
          />
        )}
      </div>
    </CheckoutShell>
  );
}
