'use client'

import { useEffect, useRef, useState } from 'react'
import { ImageUp, Trash2 } from 'lucide-react'
import type { IconAsset } from '@/lib/types'
import type { BuilderConfig } from './types'
import type { FieldErrors } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { StepCard } from './step-card'

interface OptionsStepProps {
  config: BuilderConfig
  onChange: (patch: Partial<BuilderConfig>) => void
  errors: FieldErrors
  icon: IconAsset | null
  onIconChange: (icon: IconAsset | null) => void
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground text-pretty">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

export function OptionsStep({ config, onChange, errors, icon, onIconChange }: OptionsStepProps) {
  const iconInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!icon) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(new Blob([new Uint8Array(icon.data)]))
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [icon])

  const handleIcon = async (file: File | undefined) => {
    if (!file) return
    const ext = (file.name.split('.').pop() ?? '').toLowerCase()
    if (!['png', 'ico', 'svg'].includes(ext)) return
    const buf = await file.arrayBuffer()
    onIconChange({ name: file.name, data: new Uint8Array(buf), ext })
  }

  const win = config.window
  const inst = config.installer
  const setWin = (patch: Partial<BuilderConfig['window']>) =>
    onChange({ window: { ...win, ...patch } })
  const setInst = (patch: Partial<BuilderConfig['installer']>) =>
    onChange({ installer: { ...inst, ...patch } })

  return (
    <StepCard
      step={2}
      title="Installer options"
      description="Configure the application metadata, window, icon, and installer behavior."
    >
      <div className="flex flex-col gap-8">
        {/* Application details */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Application details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="App name" htmlFor="app-name" error={errors.name}>
              <Input
                id="app-name"
                value={config.name}
                placeholder="My Awesome App"
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </Field>
            <Field label="Version" htmlFor="app-version" hint="Semantic version, e.g. 1.0.0" error={errors.version}>
              <Input
                id="app-version"
                value={config.version}
                placeholder="1.0.0"
                onChange={(e) => onChange({ version: e.target.value })}
              />
            </Field>
            <Field label="Publisher / Author" htmlFor="app-publisher" error={errors.publisher}>
              <Input
                id="app-publisher"
                value={config.publisher}
                placeholder="Your Company"
                onChange={(e) => onChange({ publisher: e.target.value })}
              />
            </Field>
            <Field
              label="App ID"
              htmlFor="app-id"
              hint="Reverse-DNS, e.g. com.company.app"
              error={errors.appId}
            >
              <Input
                id="app-id"
                value={config.appId}
                placeholder="com.company.app"
                className="font-mono"
                onChange={(e) => onChange({ appId: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="app-desc">
                <Textarea
                  id="app-desc"
                  value={config.description}
                  placeholder="A short description"
                  rows={2}
                  onChange={(e) => onChange({ description: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Window */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Window
          </h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Width" htmlFor="win-w" error={errors.width}>
              <Input
                id="win-w"
                type="number"
                min={1}
                value={win.width}
                onChange={(e) => setWin({ width: Number(e.target.value) })}
              />
            </Field>
            <Field label="Height" htmlFor="win-h" error={errors.height}>
              <Input
                id="win-h"
                type="number"
                min={1}
                value={win.height}
                onChange={(e) => setWin({ height: Number(e.target.value) })}
              />
            </Field>
            <Field label="Min width" htmlFor="win-mw">
              <Input
                id="win-mw"
                type="number"
                min={0}
                value={win.minWidth ?? ''}
                placeholder="—"
                onChange={(e) => setWin({ minWidth: e.target.value ? Number(e.target.value) : undefined })}
              />
            </Field>
            <Field label="Min height" htmlFor="win-mh">
              <Input
                id="win-mh"
                type="number"
                min={0}
                value={win.minHeight ?? ''}
                placeholder="—"
                onChange={(e) => setWin({ minHeight: e.target.value ? Number(e.target.value) : undefined })}
              />
            </Field>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ToggleRow
              title="Resizable"
              description="Allow the user to resize the window."
              checked={win.resizable}
              onCheckedChange={(v) => setWin({ resizable: v })}
            />
            <ToggleRow
              title="Start maximized"
              description="Open the window maximized on launch."
              checked={win.maximized}
              onCheckedChange={(v) => setWin({ maximized: v })}
            />
            <ToggleRow
              title="Fullscreen"
              description="Launch the app in fullscreen mode."
              checked={win.fullscreen}
              onCheckedChange={(v) => setWin({ fullscreen: v })}
            />
            <ToggleRow
              title="Frameless window"
              description="Hide the native title bar and window frame."
              checked={win.frameless}
              onCheckedChange={(v) => setWin({ frameless: v })}
            />
          </div>
        </div>

        {/* Icon */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            App icon
          </h3>
          <input
            ref={iconInputRef}
            type="file"
            accept=".png,.ico,.svg,image/png,image/svg+xml,image/x-icon"
            className="hidden"
            onChange={(e) => handleIcon(e.target.files?.[0])}
          />
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview || '/placeholder.svg'} alt="App icon preview" className="size-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/default-icon.png" alt="Default app icon" className="size-full object-contain" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => iconInputRef.current?.click()}>
                  <ImageUp className="size-4" />
                  Upload icon
                </Button>
                {icon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => onIconChange(null)}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, ICO or SVG. Recommended 256×256 or larger. A default icon is used if none is
                provided.
              </p>
            </div>
          </div>
        </div>

        {/* Installer behavior */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Installer behavior
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              title="One-click install"
              description="Skip the standard setup wizard and install immediately."
              checked={inst.oneClick}
              onCheckedChange={(v) => setInst({ oneClick: v })}
            />
            <ToggleRow
              title="Install for all users"
              description="Machine-wide install. Requires admin rights."
              checked={inst.perMachine}
              onCheckedChange={(v) => setInst({ perMachine: v })}
            />
            <ToggleRow
              title="Let user choose install directory"
              description="Show an install-location picker (wizard mode only)."
              checked={inst.allowDirectorySelection}
              onCheckedChange={(v) => setInst({ allowDirectorySelection: v })}
              disabled={inst.oneClick}
            />
            <ToggleRow
              title="Create desktop shortcut"
              description="Add a shortcut to the desktop."
              checked={inst.desktopShortcut}
              onCheckedChange={(v) => setInst({ desktopShortcut: v })}
            />
            <ToggleRow
              title="Create Start Menu shortcut"
              description="Add a shortcut to the Start Menu."
              checked={inst.startMenuShortcut}
              onCheckedChange={(v) => setInst({ startMenuShortcut: v })}
            />
          </div>
          <div className="mt-4">
            <Field
              label="License agreement (optional)"
              htmlFor="license"
              hint="If provided, the installer shows a license page."
            >
              <Textarea
                id="license"
                value={inst.license}
                placeholder="Paste your license text here…"
                rows={3}
                onChange={(e) => setInst({ license: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </div>
    </StepCard>
  )
}
