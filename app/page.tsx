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
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Package your HTML into a desktop app
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
            Upload your HTML project, configure the app and installer, choose your targets, and
            download a complete, ready-to-build Electron project. Extract it, run one script, and get
            your installer.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <UploadStep
            project={project}
            entry={entry}
            onEntryChange={setEntry}
            onProjectChange={(p, e) => {
              setProject(p)
              setEntry(e)
            }}
          />
          <OptionsStep
            config={config}
            onChange={updateConfig}
            errors={errors}
            icon={icon}
            onIconChange={setIcon}
          />
          <PlatformStep
            targets={config.targets}
            onChange={(targets) => updateConfig({ targets })}
            error={errors.targets}
          />
          <SummaryStep
            config={config}
            entry={entry}
            project={project}
            icon={icon}
            canGenerate={canGenerate}
            blockingReason={blockingReason}
          />
        </div>
      </main>
    </div>
  )
}
