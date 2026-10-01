'use client'

import { useMemo, useState } from 'react'
import type { IconAsset, ParsedProject } from '@/lib/types'
import { validateConfig, hasErrors } from '@/lib/format'
import { Header } from '@/components/header'
import { UploadStep } from '@/components/builder/upload-step'
import { OptionsStep } from '@/components/builder/options-step'
import { PlatformStep } from '@/components/builder/platform-step'
import { SummaryStep } from '@/components/builder/summary-step'
import { BuilderConfig, defaultConfig } from '@/components/builder/types'
import { ArrowUpRight, Check, ChevronRight, Monitor, Play, Sparkles, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PRESETS = [
  { name: 'Minimal desktop', description: 'Clean, focused window', color: 'from-cyan-400 to-blue-500', width: 1180, height: 760 },
  { name: 'Productivity suite', description: 'Dense workspace layout', color: 'from-violet-400 to-fuchsia-500', width: 1440, height: 900 },
  { name: 'Media player', description: 'Immersive dark canvas', color: 'from-orange-400 to-rose-500', width: 1280, height: 720 },
]

function PreviewPanel({ config, entry, onApplyPreset }: { config: BuilderConfig; entry: string; onApplyPreset: (width: number, height: number) => void }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  return (
    <section className="preview-panel overflow-hidden rounded-2xl border border-white/10 bg-[#101318] shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white"><span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px] shadow-emerald-400" />Live preview</div>
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 text-xs text-white/55">
          {(['desktop', 'mobile'] as const).map((item) => <button key={item} onClick={() => setDevice(item)} className={cn('rounded-md px-2.5 py-1.5 capitalize transition', device === item && 'bg-white/10 text-white')}>{item}</button>)}
        </div>
      </div>
      <div className="preview-stage flex min-h-[305px] items-center justify-center p-8">
        <div className={cn('preview-window overflow-hidden rounded-xl border border-white/15 bg-[#f5f7fa] shadow-2xl transition-all duration-300', device === 'mobile' ? 'w-[190px]' : 'w-full max-w-[440px]')}>
          <div className="flex h-7 items-center gap-1 border-b border-black/10 bg-white px-3"><i className="size-2 rounded-full bg-red-400" /><i className="size-2 rounded-full bg-yellow-400" /><i className="size-2 rounded-full bg-green-400" /><span className="ml-auto text-[9px] text-slate-400">{entry || 'index.html'}</span></div>
          <div className="flex min-h-[220px] flex-col items-center justify-center bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-5 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl"><Monitor className="size-5" /></div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">{config.name || 'Your app'}</h3>
            <p className="mt-1 text-xs text-slate-500">A polished desktop experience, ready to ship.</p>
            <button className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white"><Play className="size-3 fill-current" />Launch preview</button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-white/45"><span>{config.window.width} × {config.window.height}px</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-400" />Changes sync instantly</span></div>
    </section>
  )
}

export default function BuilderPage() {
  const [project, setProject] = useState<ParsedProject | null>(null)
  const [entry, setEntry] = useState('')
  const [icon, setIcon] = useState<IconAsset | null>(null)
  const [config, setConfig] = useState<BuilderConfig>(defaultConfig)

  const updateConfig = (patch: Partial<BuilderConfig>) => setConfig((c) => ({ ...c, ...patch }))

  const hasTargets =
    config.targets.windows.length + config.targets.linux.length + config.targets.mac.length > 0

  const errors = useMemo(
    () =>
      validateConfig({
        name: config.name,
        version: config.version,
        appId: config.appId,
        publisher: config.publisher,
        width: config.window.width,
        height: config.window.height,
        entry,
        hasTargets,
      }),
    [config, entry, hasTargets],
  )

  const blockingProjectErrors = project?.warnings.some((w) => w.level === 'error') ?? false
  const hasProject = !!project && project.files.length > 0

  const canGenerate = hasProject && !blockingProjectErrors && !hasErrors(errors)

  let blockingReason: string | undefined
  if (!hasProject) blockingReason = 'Upload at least one HTML file to continue.'
  else if (blockingProjectErrors) blockingReason = 'Resolve the project errors above before generating.'
  else if (hasErrors(errors)) blockingReason = 'Fix the highlighted configuration fields before generating.'

  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary"><Sparkles className="size-3.5" /> Studio workspace</div><h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Turn your web project into something people can install.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Build a beautiful desktop app from HTML in minutes. Preview every change, start from a preset, and ship with confidence.</p></div>
          <Button variant="outline" className="w-fit gap-2 rounded-full border-border/70 bg-card/60"><WandSparkles className="size-4 text-primary" /> Explore presets <ArrowUpRight className="size-3.5" /></Button>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {PRESETS.map((preset) => <button key={preset.name} onClick={() => updateConfig({ window: { ...config.window, width: preset.width, height: preset.height } })} className="group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"><div className={cn('mb-4 h-16 rounded-lg bg-gradient-to-br opacity-90', preset.color)}><div className="flex h-full items-center justify-center"><div className="h-8 w-24 rounded-md border border-white/30 bg-white/20 backdrop-blur-sm" /></div></div><div className="flex items-center justify-between"><div><p className="text-sm font-medium">{preset.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{preset.description}</p></div><ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" /></div></button>)}
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-start">
          <div className="flex min-w-0 flex-col gap-5"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Configure</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Project setup</h2></div><span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><Check className="mr-1 inline size-3.5" /> Autosaved</span></div><UploadStep project={project} entry={entry} onEntryChange={setEntry} onProjectChange={(p, e) => { setProject(p); setEntry(e) }} /><OptionsStep config={config} onChange={updateConfig} errors={errors} icon={icon} onIconChange={setIcon} /><PlatformStep targets={config.targets} onChange={(targets) => updateConfig({ targets })} error={errors.targets} /><SummaryStep config={config} entry={entry} project={project} icon={icon} canGenerate={canGenerate} blockingReason={blockingReason} /></div>
          <div className="xl:sticky xl:top-24"><PreviewPanel config={config} entry={entry} onApplyPreset={(width, height) => updateConfig({ window: { ...config.window, width, height } })} /><div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground"><span>Preview canvas</span><span>v1.0 · Electron ready</span></div></div>
        </div>
      </main>
    </div>
  )
}
