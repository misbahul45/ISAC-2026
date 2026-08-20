import { useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Bold, ImagePlus, Italic, List, ListOrdered, Loader2, Underline as UnderlineIcon } from 'lucide-react'
import { IKContext, IKUpload } from 'imagekitio-react'
import { Button } from '@/components/ui/button'
import { useFileUpload } from '@/features/files/hooks/useFileUpload'
import { cn } from '@/lib/utils'

type RichTextEditorProps = { value: string; onChange: (value: string) => void; placeholder: string; className?: string }

function ImageUploadButton({ onUpload }: { onUpload: (url: string, name?: string) => void }) {
  const inputRef = useRef<any>(null)
  const { authenticate, registerFile, isRegistering } = useFileUpload()
  const [uploading, setUploading] = useState(false)

  return (
    <IKContext urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT} publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY} authenticator={authenticate}>
      <Button type="button" size="icon-sm" variant="ghost" disabled={uploading || isRegistering} onClick={() => inputRef.current?.click()} aria-label="Sisipkan gambar">
        {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
      </Button>
      <IKUpload
        ref={inputRef}
        hidden
        accept="image/png,image/jpeg,image/webp"
        folder="/isac-2026/exams"
        useUniqueFileName
        checks={'"file.size" < "5mb"'}
        onUploadStart={() => setUploading(true)}
        onError={() => setUploading(false)}
        onSuccess={async (result: any) => {
          try {
            await registerFile({ file_id: result.fileId, url: result.url, purpose: 'EXAM_IMAGE' })
            onUpload(result.url, result.name)
          } finally {
            setUploading(false)
          }
        }}
      />
    </IKContext>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Image.configure({ inline: false, allowBase64: false }), Placeholder.configure({ placeholder })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'min-h-32 px-4 py-3 outline-none prose prose-sm max-w-none dark:prose-invert' } },
  })

  if (!editor) return <div className="min-h-40 animate-pulse rounded-2xl bg-muted" />

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-background/50', className)}>
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
        <Button type="button" size="icon-sm" variant={editor.isActive('bold') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Tebal"><Bold /></Button>
        <Button type="button" size="icon-sm" variant={editor.isActive('italic') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Miring"><Italic /></Button>
        <Button type="button" size="icon-sm" variant={editor.isActive('underline') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Garis bawah"><UnderlineIcon /></Button>
        <Button type="button" size="icon-sm" variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Daftar"><List /></Button>
        <Button type="button" size="icon-sm" variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Daftar bernomor"><ListOrdered /></Button>
        <ImageUploadButton onUpload={(url, name) => editor.chain().focus().setImage({ src: url, alt: name ?? 'Gambar soal' }).run()} />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
