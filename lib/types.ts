// Shared domain types for the HTML -> App Builder

export interface ProjectFile {
  /** Relative path using forward slashes, e.g. "css/style.css" */
  path: string
  /** File size in bytes */
  size: number
  /** Raw bytes of the file (used when building the ZIP) */
  data: Uint8Array
}

export interface WindowOptions {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  resizable: boolean
  fullscreen: boolean
  maximized: boolean
  frameless: boolean
}

export interface InstallerOptions {
  oneClick: boolean
  perMachine: boolean
  allowDirectorySelection: boolean
  desktopShortcut: boolean
  startMenuShortcut: boolean
  license: string
}

/** Cross-platform runtime behavior (identical on Windows/Linux/macOS). */
export interface RuntimeOptions {
  /** Open http/https/mailto links in the user's default browser. */
  openExternalLinks: boolean
  /** Prevent multiple copies; focus the existing window instead. */
  singleInstance: boolean
  /** Hide the native menu bar (auto-hide on Win/Linux, no menu on mac). */
  hideMenuBar: boolean
  /** Add a system tray icon; closing the window hides to tray. */
  systemTray: boolean
  /** Enable zoom (Ctrl/Cmd +/-/0) and reload (Ctrl/Cmd+R, F5) shortcuts. */
  zoomShortcuts: boolean
  /** Show a splash screen while the app loads. */
  splashScreen: boolean
}

/** App category, mapped to platform-specific category strings at build time. */
export type AppCategory =
  | 'utility'
  | 'productivity'
  | 'developer'
  | 'education'
  | 'games'
  | 'graphics'
  | 'video'
  | 'music'
  | 'business'
  | 'network'

export type WindowsTarget = 'nsis' | 'portable'
export type LinuxTarget = 'appimage' | 'deb' | 'rpm'
export type MacTarget = 'dmg' | 'zip'

export interface TargetSelection {
  windows: WindowsTarget[]
  linux: LinuxTarget[]
  mac: MacTarget[]
}

export interface AppConfig {
  name: string
  version: string
  publisher: string
  appId: string
  description: string
  /** Copyright / legal line. Falls back to a generated one if empty. */
  copyright: string
  /** Homepage / project URL. */
  homepage: string
  /** App category, mapped per-platform at build time. */
  category: AppCategory
  /** Window/splash background color (hex), avoids white flash on launch. */
  backgroundColor: string
  entry: string
  window: WindowOptions
  installer: InstallerOptions
  runtime: RuntimeOptions
  targets: TargetSelection
  /** name of the uploaded icon file, or null for default */
  iconName: string | null
}

export interface IconAsset {
  name: string
  data: Uint8Array
  /** lowercase extension without dot */
  ext: string
}

export interface ProjectWarning {
  level: 'warning' | 'error'
  message: string
}

export interface ParsedProject {
  files: ProjectFile[]
  htmlFiles: string[]
  totalSize: number
  warnings: ProjectWarning[]
}
