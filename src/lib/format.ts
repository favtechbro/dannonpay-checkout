const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'XOF', 'XAF']);

function exponentFor(currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2;
}

// Amounts arrive as integer minor units and stay integers until the moment they
// are shown, so nothing is ever rounded on the way here.
export function formatAmount(minor: string, currency: string): string {
  const exponent = exponentFor(currency);
  const negative = minor.startsWith('-');
  const digits = (negative ? minor.slice(1) : minor).padStart(exponent + 1, '0');
  const whole = exponent === 0 ? digits : digits.slice(0, -exponent);
  const fraction = exponent === 0 ? '' : digits.slice(-exponent);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const amount = fraction ? `${grouped}.${fraction}` : grouped;
  return `${negative ? '-' : ''}${currency.toUpperCase()} ${amount}`;
}

export function minorFromMajor(input: string, currency: string): string {
  const exponent = exponentFor(currency);
  const [whole, fraction = ''] = input.trim().split('.');
  return `${whole || '0'}${fraction.padEnd(exponent, '0').slice(0, exponent)}`;
}

export function countdown(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export const METHOD_LABEL: Record<string, string> = {
  card: 'Card',
  bank_transfer: 'Bank transfer',
  mobile_money: 'Mobile money',
  bank_account: 'Bank account',
};

export const METHOD_HINT: Record<string, string> = {
  card: 'Pay with a debit or credit card',
  bank_transfer: 'Transfer to a one-time account',
  mobile_money: 'Approve a prompt on your phone',
  bank_account: 'Debit your bank account directly',
};
