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
  entry: string
  window: WindowOptions
  installer: InstallerOptions
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
