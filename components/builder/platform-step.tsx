'use client'

import { Apple, Check, Monitor, Terminal } from 'lucide-react'
import type { LinuxTarget, MacTarget, TargetSelection, WindowsTarget } from '@/lib/types'
import { cn } from '@/lib/utils'
import { StepCard } from './step-card'

interface PlatformStepProps {
  targets: TargetSelection
  onChange: (targets: TargetSelection) => void
  error?: string
}

interface TargetOption<T> {
  id: T
  name: string
  description: string
}

const WINDOWS: TargetOption<WindowsTarget>[] = [
  { id: 'nsis', name: 'NSIS Installer', description: 'Windows installer with setup wizard' },
  { id: 'portable', name: 'Portable EXE', description: 'Single executable, no installation' },
]
const LINUX: TargetOption<LinuxTarget>[] = [
  { id: 'appimage', name: 'AppImage', description: 'Run anywhere, no installation' },
  { id: 'deb', name: 'Debian (.deb)', description: 'Debian / Ubuntu package' },
  { id: 'rpm', name: 'RPM (.rpm)', description: 'Fedora / RHEL / openSUSE package' },
]
const MAC: TargetOption<MacTarget>[] = [
  { id: 'dmg', name: 'DMG', description: 'macOS disk image installer' },
  { id: 'zip', name: 'ZIP (.app)', description: 'Zipped application bundle' },
]

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function TargetCard({
  selected,
  name,
  description,
  onClick,
}: {
  selected: boolean
  name: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{name}</span>
        <span className="block text-xs text-muted-foreground text-pretty">{description}</span>
      </span>
    </button>
  )
}

function Group({
  icon,
  label,
  note,
  children,
}: {
  icon: React.ReactNode
  label: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
        {note && <span className="text-xs text-muted-foreground">— {note}</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

export function PlatformStep({ targets, onChange, error }: PlatformStepProps) {
  return (
    <StepCard
      step={3}
      title="Build targets"
      description="Choose which platforms and formats to build. Each target is produced by the generated build scripts."
    >
      <div className="flex flex-col gap-6">
        <Group icon={<Monitor className="size-4" />} label="Windows">
          {WINDOWS.map((t) => (
            <TargetCard
              key={t.id}
              name={t.name}
              description={t.description}
              selected={targets.windows.includes(t.id)}
              onClick={() => onChange({ ...targets, windows: toggle(targets.windows, t.id) })}
            />
          ))}
        </Group>

        <Group icon={<Terminal className="size-4" />} label="Linux">
          {LINUX.map((t) => (
            <TargetCard
              key={t.id}
              name={t.name}
              description={t.description}
              selected={targets.linux.includes(t.id)}
              onClick={() => onChange({ ...targets, linux: toggle(targets.linux, t.id) })}
            />
          ))}
        </Group>

        <Group icon={<Apple className="size-4" />} label="macOS" note="build on macOS">
          {MAC.map((t) => (
            <TargetCard
              key={t.id}
              name={t.name}
              description={t.description}
              selected={targets.mac.includes(t.id)}
              onClick={() => onChange({ ...targets, mac: toggle(targets.mac, t.id) })}
            />
          ))}
        </Group>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </StepCard>
  )
}
