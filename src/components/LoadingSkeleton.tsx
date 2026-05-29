export function LoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading menu">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-full bg-zinc-200"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-zinc-200"
          />
        ))}
      </div>
    </div>
  );
}
