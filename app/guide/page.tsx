import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Upload, Settings2, MonitorCog, Package, TerminalSquare, Rocket } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Build Guide — HTML → App Builder',
  description:
    'How your HTML project becomes a native desktop app, which platforms are supported, and how to run the generated build package.',
}

const STEPS = [
  {
    icon: Upload,
    title: '1. Upload your HTML project',
    body: 'Drop a single HTML file, several files, a whole folder, or a .zip archive. Everything is read directly in your browser — nothing is uploaded to a server. CSS, JS, images, fonts, JSON, audio and video are all preserved with their folder structure.',
  },
  {
    icon: Settings2,
    title: '2. Pick your entry point',
    body: 'Your main file does not have to be named index.html. If several HTML files are detected, choose which one launches first (for example main.html or game.html).',
  },
  {
    icon: MonitorCog,
    title: '3. Configure the app & installer',
    body: 'Set the app name, version, publisher, reverse-DNS app id, window size and behavior, an optional icon, and installer options like one-click install, per-machine install, shortcuts and a license agreement.',
  },
  {
    icon: Package,
    title: '4. Choose platforms & download the ZIP',
    body: 'Select Windows (NSIS installer / portable), Linux (AppImage / .deb / .rpm) and/or macOS (DMG / zipped .app). The builder generates a complete Electron + electron-builder project as a ZIP — with your exact configuration baked in.',
  },
  {
    icon: TerminalSquare,
    title: '5. Run one build script',
    body: 'Extract the ZIP and double-click build-windows.bat on Windows, or run ./build-linux.sh / ./build-macos.sh. The script checks for Node.js, installs dependencies, builds, and opens the dist/ output folder.',
  },
  {
    icon: Rocket,
    title: '6. Get your native app',
    body: 'Your installer or portable executable appears in dist/. Share it, install it, and run your HTML project as a real desktop application — fully offline.',
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">Build Guide</h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            The builder turns your HTML into a real desktop app using{' '}
            <span className="font-medium text-foreground">Electron</span> and{' '}
            <span className="font-medium text-foreground">electron-builder</span>. The web app
            generates a complete, self-contained build project — the actual native build runs locally
            on your machine, so your code never leaves your computer.
          </p>
        </header>

        <ol className="flex flex-col gap-4">
          {STEPS.map((step) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <step.icon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="text-lg font-semibold">Requirements</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Node.js 18 or newer</span> — required to
              build. The build scripts check for it and tell you if it is missing.
            </li>
            <li>
              <span className="font-medium text-foreground">Windows targets</span> build best on
              Windows. NSIS is bundled by electron-builder — no manual install needed.
            </li>
            <li>
              <span className="font-medium text-foreground">Linux targets</span> (.deb/.rpm) build on
              Linux; AppImage is the most portable option.
            </li>
            <li>
              <span className="font-medium text-foreground">macOS targets</span> (DMG/.app) must be
              built and signed on macOS due to Apple restrictions.
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
