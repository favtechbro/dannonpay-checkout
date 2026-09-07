export const PROTOCOL_VERSION = 1;

export type CheckoutMessage =
  | { type: 'ready'; version: number }
  | { type: 'resize'; version: number; height: number }
  | { type: 'success'; version: number; reference: string }
  | { type: 'close'; version: number }
  | { type: 'error'; version: number; code: string };

// The page only ever speaks to the window that framed it, and only in this
// vocabulary. Nothing about the payment itself travels this way — the merchant
// still confirms the reference with our API before delivering value.
export function isEmbedded(): boolean {
  return window.self !== window.top;
}

function send(message: CheckoutMessage): void {
  if (!isEmbedded()) return;
  window.parent.postMessage(message, '*');
}

export const bridge = {
  ready: () => send({ type: 'ready', version: PROTOCOL_VERSION }),
  resize: (height: number) =>
    send({ type: 'resize', version: PROTOCOL_VERSION, height }),
  success: (reference: string) =>
    send({ type: 'success', version: PROTOCOL_VERSION, reference }),
  close: () => send({ type: 'close', version: PROTOCOL_VERSION }),
  error: (code: string) =>
    send({ type: 'error', version: PROTOCOL_VERSION, code }),
};
