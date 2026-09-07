import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ApiError,
  checkoutApi,
  type CheckoutSessionView,
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
import { AuthPrompt } from '@/components/AuthPrompt';
import { StatusPanel } from '@/components/StatusPanel';

type Stage =
  | { name: 'loading' }
  | { name: 'unavailable'; message: string }
  | { name: 'choosing' }
  | { name: 'mobile-money' }
  | { name: 'acting'; action: NextAction }
  | { name: 'settled'; tone: 'success' | 'failed'; headline: string; detail: string };

const REDIRECT_DELAY_MS = 1200;

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
    stage.name === 'acting' || stage.name === 'choosing' || stage.name === 'mobile-money';
  const liveStatus = useSessionStatus(code, watching);

  useEffect(() => {
    let cancelled = false;
    checkoutApi
      .view(code)
      .then((view) => {
        if (cancelled) return;
        setSession(view);
        applyBrandColor(view.merchant.brandColor);
        document.title = `Pay ${view.merchant.name}`;
        if (view.status === 'completed') {
          setStage({
            name: 'settled',
            tone: 'success',
            headline: 'Payment received',
            detail: 'This payment has already been completed.',
          });
          return;
        }
        if (view.status === 'expired' || view.status === 'abandoned') {
          setStage({
            name: 'unavailable',
            message:
              view.status === 'expired'
                ? 'This payment page has expired. Ask the merchant for a new link.'
                : 'This payment was cancelled.',
          });
          return;
        }
        setStage({ name: 'choosing' });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStage({
          name: 'unavailable',
          message:
            error instanceof ApiError && error.status === 404
              ? 'We could not find this payment page.'
              : 'We could not load this payment page. Please try again.',
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
    const report = () =>
      bridge.resize(document.documentElement.scrollHeight);
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
    if (liveStatus.status === 'completed') {
      setStage({
        name: 'settled',
        tone: 'success',
        headline: 'Payment received',
        detail: 'Thank you. Your payment is confirmed.',
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
      setStage({
        name: 'unavailable',
        message: 'This payment page has expired. Ask the merchant for a new link.',
      });
      return;
    }
    if (
      liveStatus.paymentStatus === 'FAILED' ||
      liveStatus.paymentStatus === 'ABANDONED'
    ) {
      setStage({
        name: 'settled',
        tone: 'failed',
        headline: 'Payment not completed',
        detail: 'Nothing was charged. You can try again with another method.',
      });
    }
  }, [liveStatus, embedded]);

  const applyAction = useCallback((action: NextAction) => {
    if (action.kind === 'open_url' && action.url) {
      window.location.assign(action.url);
      return;
    }
    if (action.kind === 'none') {
      setStage({
        name: 'acting',
        action: { kind: 'pay_offline', displayText: 'Confirming your payment…' },
      });
      return;
    }
    setStage({ name: 'acting', action });
  }, []);

  const startMethod = useCallback(
    async (channel: PaymentChannel, extra?: { network: string; phone: string }) => {
      setBusy(true);
      setNotice(null);
      try {
        const charge = await checkoutApi.pay(code, {
          channel,
          ...(extra ?? {}),
        });
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
      void startMethod(channel);
    },
    [startMethod],
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

  if (stage.name === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-canvas">
        <p role="status" className="text-[14px] text-muted">
          Loading your payment…
        </p>
      </div>
    );
  }

  if (stage.name === 'unavailable' || !session) {
    return (
      <div className="min-h-screen grid place-items-center bg-canvas px-4">
        <div className="max-w-[420px] text-center">
          <h1 className="text-[18px] font-semibold">Payment unavailable</h1>
          <p className="mt-2 text-[14px] text-muted">
            {stage.name === 'unavailable'
              ? stage.message
              : 'We could not load this payment page.'}
          </p>
        </div>
      </div>
    );
  }

  const networks =
    session.methods.find((m) => m.channel === 'mobile_money')?.networks ?? [];

  return (
    <CheckoutShell
      merchantName={session.merchant.name}
      merchantLogoUrl={session.merchant.logoUrl}
      amountMinor={session.amountMinor}
      currency={session.currency}
      description={session.description}
      embedded={embedded}
      onClose={close}
    >
      <div ref={stageRef} tabIndex={-1} className="outline-none">
        {notice && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-3 text-[13px] text-danger"
          >
            {notice}
          </p>
        )}

        {stage.name === 'choosing' && (
          <MethodSelector
            methods={session.methods}
            busy={busy}
            onChoose={choose}
          />
        )}

        {stage.name === 'mobile-money' && (
          <MobileMoneyForm
            networks={networks}
            busy={busy}
            onSubmit={(network, phone) =>
              void startMethod('mobile_money', { network, phone })
            }
            onBack={() => setStage({ name: 'choosing' })}
          />
        )}

        {stage.name === 'acting' && stage.action.kind === 'display_account' &&
          stage.action.account && (
            <TransferPanel
              account={stage.action.account}
              onExpired={() => setStage({ name: 'choosing' })}
            />
          )}

        {stage.name === 'acting' && stage.action.kind === 'pay_offline' && (
          <StatusPanel
            tone="pending"
            headline="Waiting for your approval"
            detail={
              stage.action.displayText ??
              'Approve the payment prompt on your phone to finish.'
            }
          />
        )}

        {stage.name === 'acting' &&
          stage.action.kind.startsWith('send_') &&
          stage.action.field && (
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
