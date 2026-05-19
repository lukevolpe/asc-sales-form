"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CardSelectOption {
  label: string
  value: string
  description?: string
}

interface CardSelectProps {
  legend: string
  options: CardSelectOption[]
  value: string
  onChange: (value: string) => void
  name?: string
  cols?: 1 | 2 | 3
}

export function CardSelect({
  legend,
  options,
  value,
  onChange,
  name,
  cols = 2,
}: CardSelectProps) {
  const gridClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2"

  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">{legend}</legend>
      <div className={cn("grid gap-2", gridClass)}>
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <label
              key={opt.value}
              className={cn(
                "relative flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-1",
                isSelected
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-border bg-background text-foreground hover:border-brand/50 hover:bg-muted/40"
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span className="flex-1">
                {opt.label}
                {opt.description && (
                  <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                    {opt.description}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isSelected ? "border-brand" : "border-muted-foreground/40"
                )}
              >
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-brand" />
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
