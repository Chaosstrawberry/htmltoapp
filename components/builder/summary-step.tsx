'use client'

import { useState } from 'react'
import { CheckCircle2, Download, Loader2, Package, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { AppConfig, IconAsset, ParsedProject } from '@/lib/types'
import type { BuilderConfig } from './types'
import { downloadBlob, generateBuildPackage, type ProgressStage } from '@/lib/generate'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StepCard } from './step-card'
import { cn } from '@/lib/utils'

interface SummaryStepProps {
  config: BuilderConfig
  entry: string
  project: ParsedProject | null
  icon: IconAsset | null
  canGenerate: boolean
  blockingReason?: string
}

function SummaryLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="size-4 text-primary" />
      ) : (
        <XCircle className="size-4 text-muted-foreground/50" />
      )}
      <span className={cn(!ok && 'text-muted-foreground')}>{label}</span>
    </div>
  )
}

export function SummaryStep({
  config,
  entry,
  project,
  icon,
  canGenerate,
  blockingReason,
}: SummaryStepProps) {
  const [progress, setProgress] = useState<ProgressStage | null>(null)
  const [done, setDone] = useState<{ blob: Blob; filename: string } | null>(null)

  const t = config.targets

  const handleGenerate = async () => {
    if (!project) return
    setDone(null)
    setProgress({ label: 'Preparing project', percent: 5 })
    try {
      const appConfig: AppConfig = {
        name: config.name.trim(),
        version: config.version.trim(),
        publisher: config.publisher.trim(),
        appId: config.appId.trim(),
        description: config.description.trim(),
        entry,
        window: config.window,
        installer: config.installer,
        targets: config.targets,
        iconName: icon?.name ?? null,
      }
      const result = await generateBuildPackage(
        { config: appConfig, files: project.files, icon },
        (stage) => setProgress(stage),
      )
      setDone(result)
      // Auto-start the download.
      downloadBlob(result.blob, result.filename)
      toast.success('Build package ready', {
        description: result.filename,
      })
    } catch (err) {
      console.log('[v0] generate error:', err)
      toast.error('Build package could not be created', {
        description: err instanceof Error ? err.message : 'Unexpected error while generating the ZIP.',
      })
    } finally {
      setProgress(null)
    }
  }

  const generating = progress !== null

  return (
    <StepCard step={4} title="Build summary" description="Review your configuration and generate the build package.">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Application</dt>
                <dd className="truncate font-medium">{config.name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-mono">{config.version || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">App ID</dt>
                <dd className="truncate font-mono text-xs">{config.appId || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Entry point</dt>
                <dd className="truncate font-mono text-xs">{entry || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Window</dt>
                <dd className="font-mono text-xs">
                  {config.window.width}×{config.window.height}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Platforms
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <SummaryLine ok={t.windows.includes('nsis')} label="Windows NSIS" />
              <SummaryLine ok={t.windows.includes('portable')} label="Windows Portable" />
              <SummaryLine ok={t.linux.includes('appimage')} label="Linux AppImage" />
              <SummaryLine ok={t.linux.includes('deb')} label="Debian" />
              <SummaryLine ok={t.linux.includes('rpm')} label="RPM" />
              <SummaryLine ok={t.mac.includes('dmg')} label="macOS DMG" />
              <SummaryLine ok={t.mac.includes('zip')} label="macOS ZIP" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Installer
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <SummaryLine ok={config.installer.desktopShortcut} label="Desktop shortcut" />
              <SummaryLine ok={config.installer.startMenuShortcut} label="Start Menu shortcut" />
              <SummaryLine ok={config.installer.perMachine} label="Per-machine install" />
              <SummaryLine ok={config.installer.allowDirectorySelection} label="Directory selection" />
              <SummaryLine ok={config.installer.oneClick} label="One-click install" />
              <SummaryLine ok={!!config.installer.license.trim()} label="License agreement" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        {generating ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Loader2 className="size-4 animate-spin text-primary" />
                {progress?.label}
              </span>
              <span className="tabular-nums text-muted-foreground">{progress?.percent}%</span>
            </div>
            <Progress value={progress?.percent ?? 0} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {!canGenerate && blockingReason && (
              <p className="text-sm text-destructive">{blockingReason}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={handleGenerate} disabled={!canGenerate}>
                <Package className="size-4" />
                Generate build package
              </Button>
              {done && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => downloadBlob(done.blob, done.filename)}
                >
                  <Download className="size-4" />
                  Download ZIP again
                </Button>
              )}
            </div>
            {done && (
              <p className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="size-4" />
                {done.filename} is ready — extract it and run{' '}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">build.bat</code> (Windows)
                or <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">./build.sh</code>{' '}
                (Linux/macOS).
              </p>
            )}
          </div>
        )}
      </div>
    </StepCard>
  )
}
