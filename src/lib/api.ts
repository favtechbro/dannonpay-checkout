const API_BASE = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1/api'
).replace(/\/$/, '');

export type PaymentChannel =
  | 'card'
  | 'bank_transfer'
  | 'mobile_money'
  | 'bank_account';

export type SessionStatus =
  | 'created'
  | 'active'
  | 'processing'
  | 'completed'
  | 'expired'
  | 'abandoned';

export type NextActionKind =
  | 'none'
  | 'open_url'
  | 'display_account'
  | 'pay_offline'
  | 'send_pin'
  | 'send_otp'
  | 'send_phone'
  | 'send_birthday'
  | 'send_address';

export interface TransferAccount {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amountMinor: string;
  currency: string;
  expiresAt: string;
}

export interface NextAction {
  kind: NextActionKind;
  url?: string;
  field?: string;
  account?: TransferAccount;
  displayText?: string;
}

export interface MobileMoneyNetwork {
  code: string;
  name: string;
}

export interface CheckoutMethod {
  channel: PaymentChannel;
  networks: MobileMoneyNetwork[];
}

export interface CheckoutSessionView {
  code: string;
  status: SessionStatus;
  amountMinor: string;
  currency: string;
  description: string | null;
  customerEmail: string;
  customerName: string | null;
  expiresAt: string;
  merchant: { name: string; logoUrl: string | null; brandColor: string | null };
  methods: CheckoutMethod[];
  reference: string | null;
  successUrl: string | null;
  cancelUrl: string | null;
}

export interface ChargeView {
  reference: string;
  status: string;
  nextAction: NextAction;
}

export interface SessionStatusView {
  status: SessionStatus;
  reference: string | null;
  paymentStatus: string | null;
  nextAction: NextAction;
  successUrl: string | null;
}

export interface PaymentLinkView {
  code: string;
  title: string;
  description: string | null;
  currency: string;
  amountMinor: string | null;
  minAmountMinor: string | null;
  maxAmountMinor: string | null;
  collectPhone: boolean;
  acceptingPayments: boolean;
  unavailableReason: string | null;
  merchantName: string;
  merchantLogoUrl: string | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Envelope<T> {
  message?: string;
  data: T;
  error?: { message?: string };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError('We could not reach the payment service.', 0);
  }

  const body = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok) {
    throw new ApiError(
      body?.error?.message ?? body?.message ?? 'Something went wrong.',
      response.status,
    );
  }
  return (body?.data ?? (body as unknown)) as T;
}

export const checkoutApi = {
  view: (code: string) =>
    request<CheckoutSessionView>(`/checkout/${encodeURIComponent(code)}`),

  pay: (
    code: string,
    payload: {
      channel: PaymentChannel;
      network?: string;
      phone?: string;
      email?: string;
      name?: string;
    },
  ) =>
    request<ChargeView>(`/checkout/${encodeURIComponent(code)}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submit: (code: string, field: string, value: string) =>
    request<ChargeView>(
      `/checkout/${encodeURIComponent(code)}/submit/${encodeURIComponent(field)}`,
      { method: 'POST', body: JSON.stringify({ value }) },
    ),

  status: (code: string) =>
    request<SessionStatusView>(
      `/checkout/${encodeURIComponent(code)}/status`,
    ),

  cancel: (code: string) =>
    request<SessionStatusView>(
      `/checkout/${encodeURIComponent(code)}/cancel`,
      { method: 'POST' },
    ),

  eventsUrl: (code: string) =>
    `${API_BASE}/checkout/${encodeURIComponent(code)}/events`,

  link: (slug: string) =>
    request<PaymentLinkView>(`/pay/${encodeURIComponent(slug)}`),

  startLinkSession: (
    slug: string,
    payload: { email: string; name: string; phone?: string; amount?: string },
  ) =>
    request<{ accessCode: string; checkoutUrl: string }>(
      `/pay/${encodeURIComponent(slug)}/session`,
      { method: 'POST', body: JSON.stringify(payload) },
    ),
};
