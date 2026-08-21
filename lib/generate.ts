import JSZip from 'jszip'
import type { AppConfig, IconAsset, ProjectFile } from './types'
import { safeProductName, slugify } from './format'
import {
  appConfigJson,
  buildBat,
  buildLinuxSh,
  buildMacosSh,
  buildPortableBat,
  buildSh,
  buildWindowsBat,
  gitignore,
  mainJs,
  packageJson,
  preloadJs,
} from './templates'
import { buildMd, readmeMd } from './docs'

export interface GenerateInput {
  config: AppConfig
  files: ProjectFile[]
  icon: IconAsset | null
}

export interface GenerateResult {
  blob: Blob
  filename: string
}

export type ProgressStage = {
  label: string
  percent: number
}

export async function generateBuildPackage(
  input: GenerateInput,
  onProgress?: (stage: ProgressStage) => void,
): Promise<GenerateResult> {
  const { config, files, icon } = input
  const report = (label: string, percent: number) => onProgress?.({ label, percent })

  const productName = safeProductName(config.name)
  const slug = slugify(config.name)
  const rootDir = `${productName}-${config.version}`

  const zip = new JSZip()
  const root = zip.folder(rootDir)!

  report('Preparing project', 10)

  // 1. Copy the user's HTML project into app/
  const appFolder = root.folder('app')!
  for (const file of files) {
    appFolder.file(file.path, file.data)
  }

  report('Bundling assets', 35)

  // 2. Icon(s) into icons/
  const iconsFolder = root.folder('icons')!
  if (icon) {
    // Always provide a png named icon.png for electron-builder; also keep the
    // original if it was a different format (e.g. .ico).
    if (icon.ext === 'png') {
      iconsFolder.file('icon.png', icon.data)
    } else {
      iconsFolder.file(`icon.${icon.ext}`, icon.data)
      // still write a png fallback name using the raw data won't be valid;
      // instead fetch the bundled default as png fallback below.
    }
  }
  if (!icon || icon.ext !== 'png') {
    // Ensure a valid PNG icon exists for cross-platform icon generation.
    const fallback = await loadDefaultIcon()
    if (fallback) iconsFolder.file('icon.png', fallback)
  }

  report('Generating configuration', 55)

  // 3. Config
  root.folder('config')!.file('app-config.json', appConfigJson(config))

  // 4. Core Electron files
  root.file('main.js', mainJs())
  root.file('preload.js', preloadJs())
  root.file('package.json', packageJson(config, { slug }))
  root.file('.gitignore', gitignore())

  if (config.installer.license.trim()) {
    root.file('LICENSE.txt', config.installer.license.trim() + '\n')
  }

  report('Creating build scripts', 75)

  // 5. Build scripts (per-platform in scripts/, one-click at root)
  const scripts = root.folder('scripts')!
  const hasWin = config.targets.windows.length > 0
  const hasLinux = config.targets.linux.length > 0
  const hasMac = config.targets.mac.length > 0

  if (hasWin) {
    root.file('build.bat', buildBat(config))
    scripts.file('build-windows.bat', buildWindowsBat(config))
    if (config.targets.windows.includes('portable')) {
      scripts.file('build-portable.bat', buildPortableBat(config))
    }
  }
  if (hasLinux || hasMac) {
    root.file('build.sh', buildSh(config), { unixPermissions: 0o755 })
  }
  if (hasLinux) {
    scripts.file('build-linux.sh', buildLinuxSh(config), { unixPermissions: 0o755 })
  }
  if (hasMac) {
    scripts.file('build-macos.sh', buildMacosSh(config), { unixPermissions: 0o755 })
  }

  // 6. Docs
  root.file('README.md', readmeMd(config))
  root.file('BUILD.md', buildMd(config))

  report('Compressing package', 90)

  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
      platform: 'UNIX',
    },
    (meta) => {
      // Map compression 0-100 into the 90-100 tail of our progress bar.
      report('Compressing package', 90 + Math.round(meta.percent / 10))
    },
  )

  report('Package ready', 100)

  return { blob, filename: `${productName}-${config.version}-build.zip` }
}

let cachedDefaultIcon: Uint8Array | null = null

async function loadDefaultIcon(): Promise<Uint8Array | null> {
  if (cachedDefaultIcon) return cachedDefaultIcon
  try {
    const res = await fetch('/default-icon.png')
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    cachedDefaultIcon = new Uint8Array(buf)
    return cachedDefaultIcon
  } catch {
    return null
  }
}

/** Trigger a browser download for a generated blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
