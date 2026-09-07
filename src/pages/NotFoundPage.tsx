export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-canvas px-4">
      <div className="max-w-[420px] text-center">
        <h1 className="text-[18px] font-semibold">Nothing to pay here</h1>
        <p className="mt-2 text-[14px] text-muted">
          This address does not point at a payment. Check the link you were
          given.
        </p>
      </div>
    </div>
  );
}
