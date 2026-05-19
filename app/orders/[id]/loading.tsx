export default function OrderDetailLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 rounded-lg bg-muted" />
        <div className="h-4 w-px bg-border" />
        <div className="h-6 w-48 rounded-md bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted ml-2" />
      </div>

      <div className="rounded-xl border border-brand/20 bg-brand/10 p-6 text-center">
        <div className="h-3 w-24 rounded bg-muted mx-auto mb-2" />
        <div className="h-9 w-40 rounded-lg bg-muted mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-3">
            <div className="h-4 w-24 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex gap-2">
                <div className="h-4 w-32 rounded bg-muted shrink-0" />
                <div className="h-4 w-40 rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
