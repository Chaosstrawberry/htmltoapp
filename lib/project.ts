import JSZip from 'jszip'
import type { ParsedProject, ProjectFile, ProjectWarning } from './types'

// File extensions that should never appear inside an HTML project and that we
// refuse to package (native binaries / installers / scripts of other kinds).
const BLOCKED_EXTENSIONS = new Set([
  'exe',
  'msi',
  'dll',
  'so',
  'dylib',
  'bin',
  'com',
  'scr',
  'app',
  'apk',
  'jar',
  'deb',
  'rpm',
  'appimage',
  'dmg',
  'pkg',
])

const MAX_FILE_BYTES = 100 * 1024 * 1024 // 100 MB per file
const MAX_TOTAL_BYTES = 400 * 1024 * 1024 // 400 MB total

function extOf(path: string): string {
  const base = path.split('/').pop() ?? ''
  const dot = base.lastIndexOf('.')
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : ''
}

function normalizePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .split('/')
    .filter((seg) => seg && seg !== '.')
    .join('/')
}

/** If every file lives under one shared top-level folder, strip it. */
function stripCommonRoot(files: ProjectFile[]): ProjectFile[] {
  if (files.length === 0) return files
  const firstSeg = files[0].path.split('/')[0]
  if (!firstSeg) return files
  const allShare = files.every(
    (f) => f.path.startsWith(firstSeg + '/') && f.path.split('/').length > 1,
  )
  if (!allShare) return files
  return files.map((f) => ({ ...f, path: f.path.slice(firstSeg.length + 1) }))
}

async function readFile(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer()
  return new Uint8Array(buf)
}

function isZip(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith('.zip') ||
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed'
  )
}

async function extractZip(file: File): Promise<ProjectFile[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const out: ProjectFile[] = []
  const entries = Object.values(zip.files)
  for (const entry of entries) {
    if (entry.dir) continue
    const path = normalizePath(entry.name)
    // Guard against path traversal / absolute paths inside the archive.
    if (!path || path.includes('..')) continue
    if (path.startsWith('__MACOSX/') || path.split('/').pop()?.startsWith('.')) {
      if (path.split('/').pop() === '.DS_Store') continue
    }
    const data = await entry.async('uint8array')
    out.push({ path, size: data.byteLength, data })
  }
  return out
}

/**
 * Ingest a set of dropped/selected browser Files into a normalized project.
 * Handles folder uploads (webkitRelativePath), individual files, and ZIPs.
 */
export async function ingestFiles(fileList: File[]): Promise<ParsedProject> {
  let collected: ProjectFile[] = []
  const warnings: ProjectWarning[] = []

  for (const file of fileList) {
    if (isZip(file)) {
      try {
        const extracted = await extractZip(file)
        collected.push(...extracted)
      } catch {
        warnings.push({
          level: 'error',
          message: `Could not read the ZIP archive "${file.name}". It may be corrupted.`,
        })
      }
      continue
    }

    // Folder uploads expose a relative path via webkitRelativePath.
    const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath
    const path = normalizePath(rel && rel.length > 0 ? rel : file.name)
    if (!path) continue
    const data = await readFile(file)
    collected.push({ path, size: data.byteLength, data })
  }

  // De-duplicate by path (last one wins).
  const byPath = new Map<string, ProjectFile>()
  for (const f of collected) {
    if (f.path.split('/').pop() === '.DS_Store') continue
    if (f.path.startsWith('__MACOSX/')) continue
    byPath.set(f.path, f)
  }
  collected = stripCommonRoot([...byPath.values()])
  collected.sort((a, b) => a.path.localeCompare(b.path))

  // Validate contents.
  let totalSize = 0
  for (const f of collected) {
    totalSize += f.size
    const ext = extOf(f.path)
    if (BLOCKED_EXTENSIONS.has(ext)) {
      warnings.push({
        level: 'error',
        message: `Unsupported file "${f.path}". Native binaries/installers cannot be packaged — remove it and try again.`,
      })
    } else if (f.size > MAX_FILE_BYTES) {
      warnings.push({
        level: 'error',
        message: `"${f.path}" is larger than the 100 MB per-file limit.`,
      })
    }
  }
  if (totalSize > MAX_TOTAL_BYTES) {
    warnings.push({
      level: 'error',
      message: `Project is larger than the 400 MB total limit.`,
    })
  }

  const htmlFiles = collected
    .filter((f) => {
      const ext = extOf(f.path)
      return ext === 'html' || ext === 'htm'
    })
    .map((f) => f.path)

  if (htmlFiles.length === 0) {
    warnings.push({
      level: 'error',
      message: 'No HTML entry file found. Please upload at least one HTML file.',
    })
  }

  // Scan the likely entry HTML files for missing local asset references.
  warnings.push(...scanAssetReferences(collected, htmlFiles))

  return { files: collected, htmlFiles, totalSize, warnings }
}

function resolveRelative(fromFile: string, ref: string): string {
  const dir = fromFile.split('/').slice(0, -1)
  const parts = ref.split('/')
  const stack = [...dir]
  for (const part of parts) {
    if (part === '' || part === '.') continue
    if (part === '..') stack.pop()
    else stack.push(part)
  }
  return stack.join('/')
}

function isExternalRef(ref: string): boolean {
  return (
    /^[a-z]+:/i.test(ref) || // http:, https:, data:, mailto:, tel:, blob:
    ref.startsWith('//') ||
    ref.startsWith('#') ||
    ref.startsWith('{{') || // templating
    ref.trim() === ''
  )
}

function scanAssetReferences(files: ProjectFile[], htmlFiles: string[]): ProjectWarning[] {
  const warnings: ProjectWarning[] = []
  if (typeof DOMParser === 'undefined') return warnings
  const existing = new Set(files.map((f) => f.path.toLowerCase()))
  const decoder = new TextDecoder('utf-8')
  const parser = new DOMParser()
  let missingCount = 0

  for (const htmlPath of htmlFiles) {
    const file = files.find((f) => f.path === htmlPath)
    if (!file) continue
    let doc: Document
    try {
      doc = parser.parseFromString(decoder.decode(file.data), 'text/html')
    } catch {
      continue
    }
    const refs: string[] = []
    doc.querySelectorAll('[src]').forEach((el) => {
      const v = el.getAttribute('src')
      if (v) refs.push(v)
    })
    doc.querySelectorAll('link[href]').forEach((el) => {
      const v = el.getAttribute('href')
      if (v) refs.push(v)
    })

    for (const ref of refs) {
      const clean = ref.split('?')[0].split('#')[0]
      if (isExternalRef(clean)) continue
      const resolved = resolveRelative(htmlPath, clean.replace(/^\//, ''))
      if (!existing.has(resolved.toLowerCase())) {
        if (missingCount < 8) {
          warnings.push({
            level: 'warning',
            message: `${htmlPath} references "${ref}", but the file was not found.`,
          })
        }
        missingCount++
      }
    }
  }
  if (missingCount > 8) {
    warnings.push({
      level: 'warning',
      message: `…and ${missingCount - 8} more missing asset reference(s).`,
    })
  }
  return warnings
}

/** Pick the most likely default entry point from a list of html files. */
export function pickDefaultEntry(htmlFiles: string[]): string {
  if (htmlFiles.length === 0) return ''
  const root = htmlFiles.filter((p) => !p.includes('/'))
  const pool = root.length > 0 ? root : htmlFiles
  const index = pool.find((p) => p.toLowerCase().endsWith('index.html'))
  if (index) return index
  // shortest path wins as a heuristic
  return [...pool].sort((a, b) => a.length - b.length)[0]
}
