import type { ReactNode } from 'react'

export function StepCard({
  step,
  title,
  description,
  children,
  action,
}: {
  step: number | string
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {step}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-card-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
