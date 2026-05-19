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

function StepCircle({ state, index }: { state: FormStep["state"]; index: number }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
        state === "active" && "bg-brand text-white ring-2 ring-brand/30",
        state === "completed" && "bg-brand text-white",
        state === "pending" && "border-2 border-muted-foreground/30 text-muted-foreground bg-background",
        state === "error" && "bg-destructive text-white"
      )}
    >
      {state === "completed" ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : state === "error" ? (
        <AlertTriangle className="size-3.5" strokeWidth={2.5} />
      ) : (
        <span>{index + 1}</span>
      )}
    </span>
  )
}

function StepNode({ step, index }: { step: FormStep; index: number }) {
  const isClickable = step.state === "completed" && !!step.onClick

  const inner = (
    <div className="flex flex-col items-center gap-1.5">
      <StepCircle state={step.state} index={index} />
      <span
        className={cn(
          "hidden md:block text-xs font-medium text-center leading-tight max-w-18",
          step.state === "active" && "text-brand",
          step.state === "completed" && "text-foreground",
          step.state === "pending" && "text-muted-foreground",
          step.state === "error" && "text-destructive"
        )}
      >
        {step.label}
      </span>
    </div>
  )

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={step.onClick}
        aria-current={step.state === "active" ? "step" : undefined}
        className="flex flex-col items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
      >
        {inner}
      </button>
    )
  }

  return (
    <div
      className="flex flex-col items-center"
      aria-current={step.state === "active" ? "step" : undefined}
    >
      {inner}
    </div>
  )
}

function MobileProgress({ steps }: { steps: FormStep[] }) {
  const currentIndex = steps.findIndex((s) => s.state === "active")
  const completedCount = steps.filter((s) => s.state === "completed" || s.state === "error").length
  const activeStep = steps[currentIndex]
  const displayIndex = currentIndex >= 0 ? currentIndex : completedCount
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0

  return (
    <div className="flex flex-col gap-2 md:hidden">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-brand">
          {activeStep?.label ?? steps[steps.length - 1]?.label}
        </span>
        <span className="text-muted-foreground text-xs">
          Step {displayIndex + 1} of {steps.length}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function StepIndicator({ steps }: { steps: FormStep[] }) {
  return (
    <nav aria-label="Form progress">
      {/* Mobile: compact progress bar */}
      <MobileProgress steps={steps} />

      {/* Desktop: numbered circles with connector lines */}
      <div className="hidden md:flex items-start">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <StepNode step={step} index={index} />
            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  "mt-3.5 h-px flex-1 min-w-4 transition-colors",
                  step.state === "completed" ? "bg-brand" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  )
}
