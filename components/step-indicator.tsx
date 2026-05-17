"use client"

import * as React from "react"
import { Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormStep {
  id: string
  label: string
  state: "pending" | "active" | "completed" | "error"
  onClick?: () => void
}

function StepDot({ state, index }: { state: FormStep["state"]; index: number }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0",
        state === "active" && "bg-brand text-white",
        state === "completed" && "bg-brand text-white",
        state === "pending" && "border border-muted-foreground/40 text-muted-foreground bg-background",
        state === "error" && "bg-destructive text-white"
      )}
    >
      {state === "completed" ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : (
        <span>{index + 1}</span>
      )}
    </span>
  )
}

function StepNode({ step, index }: { step: FormStep; index: number }) {
  const isClickable = step.state === "completed" && !!step.onClick
  const inner = (
    <>
      <StepDot state={step.state} index={index} />
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap",
          step.state === "active" && "text-brand",
          step.state === "completed" && "text-foreground",
          step.state === "pending" && "text-muted-foreground",
          step.state === "error" && "text-destructive"
        )}
      >
        {step.label}
      </span>
      {step.state === "error" && (
        <span
          aria-label="Step contains errors"
          className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-destructive/15 text-destructive"
        >
          <AlertTriangle className="size-3" strokeWidth={2.5} />
        </span>
      )}
    </>
  )

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={step.onClick}
        aria-current={step.state === "active" ? "step" : undefined}
        className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {inner}
      </button>
    )
  }

  return (
    <div
      className="flex items-center gap-2"
      aria-current={step.state === "active" ? "step" : undefined}
    >
      {inner}
    </div>
  )
}

export function StepIndicator({ steps }: { steps: FormStep[] }) {
  return (
    <nav aria-label="Form progress" className="flex items-center flex-wrap gap-y-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <StepNode step={step} index={index} />
          {index < steps.length - 1 && (
            <div className="mx-3 h-px w-6 bg-border shrink-0" aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
