import { EmptyState } from '@/components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      title="Nothing to pay here"
      detail="This address does not point at a payment. Check the link you were given."
    />
  );
}
