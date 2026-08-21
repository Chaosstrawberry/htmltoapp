import type { InstallerOptions, TargetSelection, WindowOptions } from '@/lib/types'

export interface BuilderConfig {
  name: string
  version: string
  publisher: string
  appId: string
  description: string
  window: WindowOptions
  installer: InstallerOptions
  targets: TargetSelection
}

export const defaultConfig: BuilderConfig = {
  name: 'My Awesome App',
  version: '1.0.0',
  publisher: 'Your Company',
  appId: 'com.company.app',
  description: '',
  window: {
    width: 1200,
    height: 800,
    minWidth: undefined,
    minHeight: undefined,
    resizable: true,
    fullscreen: false,
    maximized: false,
    frameless: false,
  },
  installer: {
    oneClick: false,
    perMachine: false,
    allowDirectorySelection: true,
    desktopShortcut: true,
    startMenuShortcut: true,
    license: '',
  },
  targets: {
    windows: ['nsis', 'portable'],
    linux: ['appimage'],
    mac: ['dmg'],
  },
}
