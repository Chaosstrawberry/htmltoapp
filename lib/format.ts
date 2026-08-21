// Formatting + validation helpers

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const value = bytes / Math.pow(k, i)
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${sizes[i]}`
}

/**
 * Turn an arbitrary app name into a safe, filesystem/package friendly slug.
 * "My Awesome App" -> "my-awesome-app"
 */
export function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-') || 'app'
  )
}

/**
 * PascalCase-ish product folder/file name: "My Awesome App" -> "My-Awesome-App"
 */
export function safeProductName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'App'
}

const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z-.]+)?$/
const APPID_RE = /^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/

export interface FieldErrors {
  name?: string
  version?: string
  appId?: string
  publisher?: string
  width?: string
  height?: string
  entry?: string
  targets?: string
}

export function validateConfig(input: {
  name: string
  version: string
  appId: string
  publisher: string
  width: number
  height: number
  entry: string
  hasTargets: boolean
}): FieldErrors {
  const errors: FieldErrors = {}

  if (!input.name.trim()) {
    errors.name = 'App name is required.'
  } else if (/[<>:"/\\|?*]/.test(input.name)) {
    errors.name = 'App name contains invalid characters.'
  }

  if (!input.version.trim()) {
    errors.version = 'Version is required.'
  } else if (!SEMVER_RE.test(input.version.trim())) {
    errors.version = 'Use semantic versioning, e.g. 1.0.0'
  }

  if (!input.appId.trim()) {
    errors.appId = 'App ID is required.'
  } else if (!APPID_RE.test(input.appId.trim())) {
    errors.appId = 'Use reverse-DNS format, e.g. com.company.app'
  }

  if (!input.publisher.trim()) {
    errors.publisher = 'Publisher is required.'
  }

  if (!Number.isFinite(input.width) || input.width <= 0) {
    errors.width = 'Width must be a positive number.'
  }

  if (!Number.isFinite(input.height) || input.height <= 0) {
    errors.height = 'Height must be a positive number.'
  }

  if (!input.entry) {
    errors.entry = 'Select a start HTML file.'
  }

  if (!input.hasTargets) {
    errors.targets = 'Select at least one build target.'
  }

  return errors
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
