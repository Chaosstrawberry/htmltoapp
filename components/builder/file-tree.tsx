'use client'

import { useMemo } from 'react'
import {
  ChevronRight,
  File,
  FileCode2,
  FileImage,
  FileJson,
  FileType,
  Folder,
  Music,
  Video,
  X,
} from 'lucide-react'
import type { ProjectFile } from '@/lib/types'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TreeNode {
  name: string
  path: string
  size: number
  children: Map<string, TreeNode>
  isFile: boolean
}

function buildTree(files: ProjectFile[]): TreeNode {
  const root: TreeNode = { name: '', path: '', size: 0, children: new Map(), isFile: false }
  for (const file of files) {
    const parts = file.path.split('/')
    let cur = root
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1
      let next = cur.children.get(part)
      if (!next) {
        next = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          size: isFile ? file.size : 0,
          children: new Map(),
          isFile,
        }
        cur.children.set(part, next)
      }
      cur = next
    })
  }
  return root
}

function iconForFile(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const cls = 'size-4 shrink-0'
  if (ext === 'html' || ext === 'htm') return <FileCode2 className={cn(cls, 'text-primary')} />
  if (['js', 'mjs', 'ts', 'css'].includes(ext)) return <FileCode2 className={cn(cls, 'text-muted-foreground')} />
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext))
    return <FileImage className={cn(cls, 'text-muted-foreground')} />
  if (ext === 'json') return <FileJson className={cn(cls, 'text-muted-foreground')} />
  if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) return <FileType className={cn(cls, 'text-muted-foreground')} />
  if (['mp3', 'wav', 'ogg'].includes(ext)) return <Music className={cn(cls, 'text-muted-foreground')} />
  if (['mp4', 'webm', 'mov'].includes(ext)) return <Video className={cn(cls, 'text-muted-foreground')} />
  return <File className={cn(cls, 'text-muted-foreground')} />
}

function NodeRow({
  node,
  depth,
  entry,
  onRemove,
}: {
  node: TreeNode
  depth: number
  entry: string
  onRemove?: (path: string) => void
}) {
  const children = [...node.children.values()].sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  return (
    <>
      {children.map((child) => (
        <div key={child.path}>
          <div
            className="group flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-secondary/60"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {child.isFile ? (
              iconForFile(child.name)
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <ChevronRight className="size-3.5" />
                <Folder className="size-4 text-primary/70" />
              </span>
            )}
            <span className={cn('truncate', child.path === entry && 'font-medium text-primary')}>
              {child.name}
            </span>
            {child.path === entry && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                entry
              </span>
            )}
            <span className="ml-auto flex items-center gap-2">
              {child.isFile && (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatBytes(child.size)}
                </span>
              )}
              {child.isFile && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(child.path)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${child.name}`}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </span>
          </div>
          {!child.isFile && (
            <NodeRow node={child} depth={depth + 1} entry={entry} onRemove={onRemove} />
          )}
        </div>
      ))}
    </>
  )
}

export function FileTree({
  files,
  entry,
  onRemove,
}: {
  files: ProjectFile[]
  entry: string
  onRemove?: (path: string) => void
}) {
  const tree = useMemo(() => buildTree(files), [files])
  return (
    <div className="max-h-80 overflow-auto rounded-lg border border-border bg-muted/30 p-2">
      <NodeRow node={tree} depth={0} entry={entry} onRemove={onRemove} />
    </div>
  )
}
