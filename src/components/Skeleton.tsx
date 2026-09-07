export function MethodSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="skeleton h-6 w-3/5" />
      <div className="skeleton h-4 w-2/5 !mb-6" />
      <div className="skeleton h-[76px] w-full rounded-control" />
      <div className="skeleton h-[76px] w-full rounded-control" />
      <div className="skeleton h-[52px] w-full rounded-control !mt-6" />
    </div>
  );
}
