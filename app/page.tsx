'use client'

import { Header } from '@/components/header'
import { BuilderWorkspace } from '@/components/builder/builder-workspace'

export default function BuilderPage() {
  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            HTML to desktop app
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Turn your web project into a desktop app.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
            A guided, private workspace for packaging HTML, CSS, JavaScript, and assets into a ready-to-build Electron project.
          </p>
        </div>
        <BuilderWorkspace />
      </main>
    </div>
  )
}
