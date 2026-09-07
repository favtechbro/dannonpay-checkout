import { useEffect, useRef, useState } from 'react';
import { checkoutApi, type SessionStatusView } from '@/lib/api';

const POLL_MS = 4000;
const SETTLED: SessionStatusView['status'][] = [
  'completed',
  'expired',
  'abandoned',
];

/**
 * Server-sent status with polling underneath it. The stream makes the page feel
 * immediate; the poll is what guarantees the customer still sees the outcome if
 * the stream never connects.
 */
export function useSessionStatus(
  code: string,
  active: boolean,
): SessionStatusView | null {
  const [status, setStatus] = useState<SessionStatusView | null>(null);
  const settled = useRef(false);

  useEffect(() => {
    if (!code || !active) return;
    settled.current = false;
    let cancelled = false;

    const apply = (next: SessionStatusView) => {
      if (cancelled) return;
      setStatus(next);
      if (SETTLED.includes(next.status)) settled.current = true;
    };

    const poll = async () => {
      try {
        apply(await checkoutApi.status(code));
      } catch {
        // The next tick tries again; a transient failure is not the outcome.
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      if (settled.current) return;
      void poll();
    }, POLL_MS);

    const stream = new EventSource(checkoutApi.eventsUrl(code));
    stream.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as
          | SessionStatusView
          | { heartbeat: number };
        if ('status' in parsed) apply(parsed);
      } catch {
        // A malformed frame is ignored; the poll still carries the truth.
      }
    };
    stream.onerror = () => stream.close();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      stream.close();
    };
  }, [code, active]);

  return status;
}
