export default function OrdersLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-24 rounded-md bg-muted" />
        <div className="h-9 w-28 rounded-lg bg-muted" />
      </div>

      <div className="h-11 w-full max-w-xs rounded-lg bg-muted" />

      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <div className="h-10 bg-muted/60" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-t border-border">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="ml-auto h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-2">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="flex justify-between mt-1">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
