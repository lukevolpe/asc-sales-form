'use client'

import * as React from 'react'

export function SuccessBanner({ message }: { message: string }) {
  const [visible, setVisible] = React.useState(true)
  if (!visible) return null
  return (
    <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-foreground">
      <span>{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
