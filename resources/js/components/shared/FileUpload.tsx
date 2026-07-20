import { useRef, useState } from 'react'
import { FileCheck2, FileText, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IKContext, IKUpload } from 'imagekitio-react'
import { postJson } from '@/lib/api'

export type UploadedFile = {
  id: string
  fileId: string
  url: string
  name?: string
} | null

type FileApiResponse = {
  status: 'success'
  message: string
  data: {
    id: string
    fileId: string
    url: string
  }
}

interface FileUploadProps {
  value: UploadedFile
  onChange: (value: UploadedFile) => void
  disabled?: boolean
  /** Folder tujuan di ImageKit, mis. "/payment-proofs" */
  folder?: string
  accept?: string
  maxSizeMB?: number
  /** Teks utama di dalam box, mis. "Bukti Upload Twibbon" */
  label?: string
  /** Teks kecil di bawah label, mis. "File PDF, Max File 10mb" */
  subLabel?: string
}

export function FileUpload({
  value,
  onChange,
  disabled,
  folder = '/uploads',
  accept = 'image/png,image/jpeg,image/webp,application/pdf',
  maxSizeMB = 10,
  label = 'Bukti Upload',
  subLabel,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const reset = () => {
    if (inputRef.current) inputRef.current.value = ''
    setStatus('idle')
    setProgress(0)
    setPendingName(null)
  }

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="truncate text-sm text-white">
            {value.name ?? 'File terupload'}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-white/60 hover:bg-white/10 hover:text-white"
          disabled={disabled}
          onClick={() => {
            onChange(null)
            reset()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <IKContext
      urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
      publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
      authenticator={async () => {
        const res = await fetch('/api/imagekit-auth')
        if (!res.ok) throw new Error('Gagal mengambil auth ImageKit')
        return res.json()
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && status !== 'uploading' && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center transition-colors hover:bg-white/10',
          (status === 'uploading' || disabled) && 'pointer-events-none opacity-70',
        )}
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-fuchsia-400" />
            <span className="font-semibold text-fuchsia-400">
              Mengupload{pendingName ? ` "${pendingName}"` : ''}... {progress}%
            </span>
          </>
        ) : (
          <>
            <FileText className="h-6 w-6 text-fuchsia-400" />
            <span className="font-semibold text-fuchsia-400">{label}</span>
            <span className="text-xs text-white/40">
              {subLabel ?? `Max File ${maxSizeMB}mb`}
            </span>
          </>
        )}
      </div>

      <IKUpload
        ref={inputRef}
        hidden
        accept={accept}
        folder={folder}
        useUniqueFileName
        checks={`"file.size" < "${maxSizeMB}mb"`}
        onChange={(e:any) => {
          setErrorMsg(null)
          setPendingName(e.target.files?.[0]?.name ?? null)
        }}
        onUploadStart={() => {
          setStatus('uploading')
          setProgress(0)
        }}
        onUploadProgress={(e:any) => {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }}
        onError={() => {
          setErrorMsg('Upload gagal, coba lagi')
          setStatus('error')
          reset()
        }}
        onSuccess={async (res:any) => {
          try {
            const response = await postJson<FileApiResponse>('/api/files', {
              fileId: res.fileId,
              url: res.url,
            })

            onChange({
              id: response.data.id,
              fileId: response.data.fileId,
              url: response.data.url,
              name: res.name,
            })
            setStatus('idle')
          } catch {
            setErrorMsg('File terupload, tetapi gagal dicatat ke database')
            setStatus('error')
            reset()
          }
        }}
      />
      {errorMsg && <p className="mt-1 text-sm text-red-400">{errorMsg}</p>}
    </IKContext>
  )
}
