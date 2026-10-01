'use client'

import { useMemo, useState } from 'react'
import {
  AppWindow,
  Check,
  Eye,
  FileCode2,
  Gamepad2,
  Layers3,
  LayoutDashboard,
  Palette,
  Rocket,
  Settings2,
  Sparkles,
  TerminalSquare,
  Wrench,
} from 'lucide-react'
import type { IconAsset, ParsedProject } from '@/lib/types'
import { validateConfig, hasErrors } from '@/lib/format'
import { UploadStep } from '@/components/builder/upload-step'
import { OptionsStep } from '@/components/builder/options-step'
import { PlatformStep } from '@/components/builder/platform-step'
import { SummaryStep } from '@/components/builder/summary-step'
import { BuilderConfig, defaultConfig } from '@/components/builder/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const steps = [
  { label: 'Add files', icon: FileCode2 },
  { label: 'Configure', icon: Settings2 },
  { label: 'Targets', icon: Layers3 },
  { label: 'Build', icon: Sparkles },
]

type Preset = {
  name: string
  description: string
  icon: typeof AppWindow
  patch: Partial<BuilderConfig>
}

const presets: Preset[] = [
  { name: 'Dashboard', description: '1200 × 800 · resizable', icon: LayoutDashboard, patch: { window: { ...defaultConfig.window, width: 1200, height: 800 } } },
  { name: 'Compact utility', description: '720 × 520 · focused', icon: Wrench, patch: { window: { ...defaultConfig.window, width: 720, height: 520, resizable: false } } },
  { name: 'Kiosk', description: 'Fullscreen · frameless', icon: AppWindow, patch: { window: { ...defaultConfig.window, fullscreen: true, frameless: true, resizable: false } } },
  { name: 'Developer tool', description: '1024 × 720 · maximized', icon: TerminalSquare, patch: { window: { ...defaultConfig.window, width: 1024, height: 720, maximized: true } } },
  { name: 'Game launcher', description: '1366 × 768 · immersive', icon: Gamepad2, patch: { window: { ...defaultConfig.window, width: 1366, height: 768, resizable: true, hideMenuBar: undefined } as BuilderConfig['window'] } },
  { name: 'Presentation', description: '1440 × 900 · clean chrome', icon: Rocket, patch: { window: { ...defaultConfig.window, width: 1440, height: 900, hideMenuBar: undefined } as BuilderConfig['window'] } },
]

export function BuilderWorkspace() {
  const [project, setProject] = useState<ParsedProject | null>(null)
  const [entry, setEntry] = useState('')
  const [icon, setIcon] = useState<IconAsset | null>(null)
  const [config, setConfig] = useState<BuilderConfig>(defaultConfig)
  const [activeStep, setActiveStep] = useState(0)
  const [showPreview, setShowPreview] = useState(true)

  const updateConfig = (patch: Partial<BuilderConfig>) => setConfig((current) => ({ ...current, ...patch }))
  const hasTargets = config.targets.windows.length + config.targets.linux.length + config.targets.mac.length > 0
  const errors = useMemo(() => validateConfig({ name: config.name, version: config.version, appId: config.appId, publisher: config.publisher, width: config.window.width, height: config.window.height, entry, hasTargets }), [config, entry, hasTargets])
  const blockingProjectErrors = project?.warnings.some((warning) => warning.level === 'error') ?? false
  const hasProject = !!project && project.files.length > 0
  const canGenerate = hasProject && !blockingProjectErrors && !hasErrors(errors)
  const completed = [hasProject, hasProject && !hasErrors(errors), hasTargets, canGenerate]

  const previewHtml = useMemo(() => {
    const file = project?.files.find((candidate) => candidate.path === entry)
    if (!file) return ''
    try {
      return new TextDecoder().decode(new Uint8Array(file.data))
    } catch {
      return ''
    }
  }, [project, entry])

  const iconPreview = useMemo(() => {
    if (!icon) return null
    return URL.createObjectURL(new Blob([new Uint8Array(icon.data)], { type: `image/${icon.ext === 'svg' ? 'svg+xml' : icon.ext}` }))
  }, [icon])

  const jumpToStep = (step: number) => setActiveStep(Math.max(0, Math.min(step, 3)))
  const onProjectChange = (next: ParsedProject | null, nextEntry: string) => {
    setProject(next)
    setEntry(nextEntry)
    if (next) setActiveStep(1)
  }
  const applyPreset = (patch: Partial<BuilderConfig>) => {
    setConfig((current) => ({ ...current, ...patch, window: patch.window ? { ...current.window, ...patch.window } : current.window }))
    setActiveStep(1)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[210px_minmax(0,1fr)_320px]">
      <aside className="hidden xl:block">
        <Card className="sticky top-6 border-border/70 bg-card/70">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Build flow</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-1">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              return <button key={step.label} type="button" onClick={() => jumpToStep(index)} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors', activeStep === index ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                <span className={cn('flex size-7 items-center justify-center rounded-full border text-xs', completed[index] ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border')}>{completed[index] ? <Check className="size-3.5" /> : <StepIcon className="size-3.5" />}</span>
                <span className="font-medium">{step.label}</span>
              </button>
            })}
            <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground"><p className="font-medium text-foreground">Tip</p><p className="mt-1">Preview your uploaded entry file before building.</p></div>
          </CardContent>
        </Card>
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3 shadow-sm">
          <div><p className="text-sm font-semibold">Create your desktop app</p><p className="text-xs text-muted-foreground">Step {activeStep + 1} of 4 · changes stay in this browser</p></div>
          <div className="flex items-center gap-2"><Badge variant={canGenerate ? 'default' : 'secondary'}>{canGenerate ? 'Ready to build' : 'In progress'}</Badge><Button variant="outline" size="sm" onClick={() => setShowPreview((value) => !value)}><Eye data-icon="inline-start" />{showPreview ? 'Hide preview' : 'Show preview'}</Button></div>
        </div>

        <div className="flex flex-col gap-6">
          <div onFocus={() => jumpToStep(0)}><UploadStep project={project} entry={entry} onEntryChange={setEntry} onProjectChange={onProjectChange} /></div>
          <div onFocus={() => jumpToStep(1)}><OptionsStep config={config} onChange={updateConfig} errors={errors} icon={icon} onIconChange={setIcon} /></div>
          <div onFocus={() => jumpToStep(2)}><PlatformStep targets={config.targets} onChange={(targets) => updateConfig({ targets })} error={errors.targets} /></div>
          <div onFocus={() => jumpToStep(3)}><SummaryStep config={config} entry={entry} project={project} icon={icon} canGenerate={canGenerate} blockingReason={!hasProject ? 'Upload at least one HTML file to continue.' : blockingProjectErrors ? 'Resolve the project errors above before generating.' : hasErrors(errors) ? 'Fix the highlighted configuration fields before generating.' : undefined} /></div>
        </div>
      </div>

      {showPreview && <aside className="xl:block">
        <Card className="sticky top-6 overflow-hidden border-border/70 bg-card/70">
          <CardHeader className="border-b border-border/60 pb-3"><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-sm"><Palette className="size-4 text-primary" /> Live preview</CardTitle><Badge variant="outline">{config.window.width}×{config.window.height}</Badge></div></CardHeader>
          <CardContent className="p-3">
            <div className="overflow-hidden rounded-lg border border-border bg-background shadow-inner">
              <div className="flex h-7 items-center gap-1.5 border-b border-border bg-muted/60 px-2"><span className="size-2 rounded-full bg-destructive/70" /><span className="size-2 rounded-full bg-amber-500/70" /><span className="size-2 rounded-full bg-primary/70" /><span className="ml-2 truncate text-[10px] text-muted-foreground">{config.name || 'Your app'}</span></div>
              {previewHtml ? <iframe title="Uploaded HTML preview" srcDoc={previewHtml} sandbox="allow-scripts" className="h-64 w-full bg-background" /> : <div className="flex min-h-64 flex-col items-center justify-center gap-3 bg-background p-5 text-center"><div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">{iconPreview ? <img src={iconPreview} alt="App icon" className="size-full object-contain" /> : <FileCode2 className="size-6" />}</div><div><p className="text-sm font-semibold">{config.name || 'Your app'}</p><p className="mt-1 text-xs text-muted-foreground">{entry || 'Upload an HTML file to preview it here'}</p></div><div className="h-1.5 w-24 rounded-full bg-muted" /><div className="h-1.5 w-16 rounded-full bg-muted" /></div>}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{previewHtml ? `Showing ${entry} inside a sandboxed preview.` : 'Upload an HTML entry file to see the real page here.'}</p>
          </CardContent>
        </Card>
        <Card className="mt-4 border-border/70 bg-card/70"><CardHeader className="pb-3"><CardTitle className="text-sm">Quick presets</CardTitle></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">{presets.map((preset) => { const PresetIcon = preset.icon; return <Button key={preset.name} variant="outline" className="h-auto justify-start gap-3 px-3 py-2 text-left" onClick={() => applyPreset(preset.patch)}><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><PresetIcon className="size-4" /></span><span className="min-w-0"><span className="block truncate text-xs font-semibold">{preset.name}</span><span className="block truncate text-[11px] font-normal text-muted-foreground">{preset.description}</span></span></Button> })}</CardContent></Card>
      </aside>}
    </div>
  )
}

export default BuilderWorkspace
