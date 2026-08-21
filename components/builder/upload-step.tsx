'use client'

import { useCallback, useRef, useState } from 'react'
import {
  AlertTriangle,
  FolderUp,
  Loader2,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import type { ParsedProject } from '@/lib/types'
import { ingestFiles, pickDefaultEntry } from '@/lib/project'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileTree } from './file-tree'
import { StepCard } from './step-card'

interface UploadStepProps {
  project: ParsedProject | null
  entry: string
  onEntryChange: (entry: string) => void
  onProjectChange: (project: ParsedProject | null, entry: string) => void
}

export function UploadStep({ project, entry, onEntryChange, onProjectChange }: UploadStepProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const projectToFiles = (p: ParsedProject | null): File[] => {
    if (!p) return []
    return p.files.map((f) => {
      const file = new File([new Uint8Array(f.data)], f.path.split('/').pop() ?? 'file')
      Object.defineProperty(file, 'webkitRelativePath', { value: f.path })
      return file
    })
  }

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const arr = Array.from(fileList)
      if (arr.length === 0) return
      setLoading(true)
      try {
        // Merge with any already-uploaded files so "add more" appends.
        const combined = [...projectToFiles(project), ...arr]
        const parsed = await ingestFiles(combined)
        const nextEntry =
          entry && parsed.htmlFiles.includes(entry) ? entry : pickDefaultEntry(parsed.htmlFiles)
        onProjectChange(parsed, nextEntry)
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onProjectChange, project, entry],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const removeFile = async (path: string) => {
    if (!project) return
    const remaining = project.files.filter((f) => f.path !== path)
    setLoading(true)
    try {
      const files = remaining.map((f) => {
        const file = new File([new Uint8Array(f.data)], f.path.split('/').pop() ?? 'file')
        Object.defineProperty(file, 'webkitRelativePath', { value: f.path })
        return file
      })
      const parsed = await ingestFiles(files)
      const nextEntry = parsed.htmlFiles.includes(entry) ? entry : pickDefaultEntry(parsed.htmlFiles)
      onProjectChange(parsed, nextEntry)
    } finally {
      setLoading(false)
    }
  }

  const errors = project?.warnings.filter((w) => w.level === 'error') ?? []
  const warns = project?.warnings.filter((w) => w.level === 'warning') ?? []

  return (
    <StepCard
      step={1}
      title="Your HTML files"
      description="Upload a single HTML file, multiple files, a folder, or a ZIP archive of your project."
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        // Folder selection (supported in Chromium/WebKit browsers)
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {!project ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors',
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
          )}
        >
          {loading ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : (
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="size-6" />
            </span>
          )}
          <div>
            <p className="font-medium">Drop your HTML files here, or click to browse</p>
            <p className="mt-1 text-sm text-muted-foreground">
              HTML, CSS, JS, images, fonts and other assets — or a .zip archive
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                folderInputRef.current?.click()
              }}
            >
              <FolderUp className="size-4" />
              Select folder
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span>
              <span className="font-semibold">{project.files.length}</span>{' '}
              <span className="text-muted-foreground">files</span>
            </span>
            <span>
              <span className="font-semibold">{formatBytes(project.totalSize)}</span>{' '}
              <span className="text-muted-foreground">total</span>
            </span>
            <span>
              <span className="font-semibold">{project.htmlFiles.length}</span>{' '}
              <span className="text-muted-foreground">HTML file(s)</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
              onClick={() => onProjectChange(null, '')}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>

          {project.htmlFiles.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entry">Start HTML file (entry point)</Label>
              <Select value={entry} onValueChange={onEntryChange}>
                <SelectTrigger id="entry" className="w-full sm:w-96">
                  <SelectValue placeholder="Select entry file" />
                </SelectTrigger>
                <SelectContent>
                  {project.htmlFiles.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <FileTree files={project.files} entry={entry} onRemove={removeFile} />

          {errors.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              {errors.map((w, i) => (
                <p key={i} className="flex items-start gap-2 text-sm text-destructive">
                  <XCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{w.message}</span>
                </p>
              ))}
            </div>
          )}
          {warns.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              {warns.map((w, i) => (
                <p key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{w.message}</span>
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" />
              Add more files
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => folderInputRef.current?.click()}>
              <FolderUp className="size-4" />
              Add folder
            </Button>
          </div>
        </div>
      )}
    </StepCard>
  )
}
