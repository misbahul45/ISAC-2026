import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Save, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Seo } from '@/components/seo/Seo'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { useAdminCompetitions } from '@/features/admin/hooks/useAdmin'
import { getJson, postJson } from '@/lib/api'
import { RichTextEditor } from '@/features/admin/components/RichTextEditor'

type Stage = { id: string; competition_id: string; name: string; order: number }
type Exam = { id: string; title: string; description: string | null; questionCount: number }
type Question = { id: string; question: string; explanation: string | null; type: string; options: { id: string; content: string }[] | null; correctAnswer: string | null; order: number }
type Response<T> = { data: T }

const emptyOption = () => ({ id: crypto.randomUUID(), content: '' })

export default function AdminQuestions() {
  const queryClient = useQueryClient()
  const competitions = useAdminCompetitions({ perPage: 100 })
  const [competitionId, setCompetitionId] = useState('')
  const [stageId, setStageId] = useState('')
  const [examId, setExamId] = useState('')
  const [question, setQuestion] = useState('')
  const [explanation, setExplanation] = useState('')
  const [type, setType] = useState<'multiple_choice' | 'true_false' | 'essay'>('multiple_choice')
  const [options, setOptions] = useState([emptyOption(), emptyOption()])
  const [correctAnswer, setCorrectAnswer] = useState('')

  const stages = useQuery({
    queryKey: ['admin', 'exam-stages', competitionId],
    queryFn: () => getJson<Response<Stage[]>>('/api/admin/exam-stages?competition_id=' + competitionId),
    enabled: Boolean(competitionId),
  })
  const exams = useQuery({
    queryKey: ['admin', 'exams', stageId],
    queryFn: () => getJson<Response<Exam[]>>('/api/admin/exams?stage_id=' + stageId),
    enabled: Boolean(stageId),
  })
  const exam = useQuery({
    queryKey: ['admin', 'exam', examId],
    queryFn: () => getJson<Response<Exam & { questions: Question[] }>>('/api/admin/exams/' + examId),
    enabled: Boolean(examId),
  })

  const createQuestion = useMutation({
    mutationFn: () => postJson('/api/admin/exams/' + examId + '/questions', {
      question, explanation: explanation || null, type,
      options: type === 'essay' ? null : options,
      correct_answer: correctAnswer || null,
      correct_score: 1, wrong_score: 0, empty_score: 0,
      difficulty: 'medium', is_active: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exam', examId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams', stageId] })
      setQuestion(''); setExplanation(''); setOptions([emptyOption(), emptyOption()]); setCorrectAnswer('')
    },
  })

  const competitionRows = competitions.data?.data ?? []
  const stageRows = stages.data?.data ?? []
  const examRows = exams.data?.data ?? []
  const activeExam = exam.data?.data
  const selectedCompetition = competitionRows.find((item) => item.id === competitionId)
  const selectedStage = stageRows.find((item) => item.id === stageId)
  const selectedExam = examRows.find((item) => item.id === examId)
  const canSave = Boolean(examId && question.replace(/<[^>]+>/g, '').trim() && (type === 'essay' || correctAnswer))
  const questionTypeLabel = useMemo(() => ({ multiple_choice: 'Pilihan ganda', true_false: 'Benar / Salah', essay: 'Esai' }), [])

  return (
    <>
      <Seo title="Buat Soal" description="Penyusunan soal ujian ISAC melalui editor rich text." canonical="/admin/questions" noindex />
      <AdminPageHeader title="Buat Soal" description="Susun pertanyaan, jawaban, gambar ImageKit, dan pembahasan dalam satu alur." />
      <div className="space-y-6">
        <Card className="border-border/60 bg-card/70"><CardHeader><CardTitle>Form soal</CardTitle><CardDescription>Pilih konteks ujian, lalu susun pertanyaan dan jawabannya. Konten HTML dibersihkan server sebelum disimpan.</CardDescription></CardHeader><CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Kompetisi</Label><Select value={competitionId} onValueChange={(v) => { setCompetitionId(v ?? ''); setStageId(''); setExamId('') }}><SelectTrigger className="w-full"><span data-slot="select-value" className={selectedCompetition ? 'flex flex-1 truncate text-left' : 'flex flex-1 text-left text-muted-foreground'}>{selectedCompetition?.name ?? 'Pilih kompetisi'}</span></SelectTrigger><SelectContent>{competitionRows.map((item) => <SelectItem value={item.id} key={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Tahap</Label><Select value={stageId} onValueChange={(v) => { setStageId(v ?? ''); setExamId('') }} disabled={!competitionId || stages.isLoading}><SelectTrigger className="w-full"><span data-slot="select-value" className={selectedStage ? 'flex flex-1 truncate text-left' : 'flex flex-1 text-left text-muted-foreground'}>{selectedStage ? `Tahap ${selectedStage.order} · ${selectedStage.name}` : stages.isLoading ? 'Memuat tahap…' : 'Pilih tahap'}</span></SelectTrigger><SelectContent>{stageRows.map((item) => <SelectItem value={item.id} key={item.id}>Tahap {item.order} · {item.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Ujian</Label><Select value={examId} onValueChange={(v) => setExamId(v ?? '')} disabled={!stageId || exams.isLoading}><SelectTrigger className="w-full"><span data-slot="select-value" className={selectedExam ? 'flex flex-1 truncate text-left' : 'flex flex-1 text-left text-muted-foreground'}>{selectedExam?.title ?? (exams.isLoading ? 'Memuat ujian…' : 'Pilih ujian')}</span></SelectTrigger><SelectContent>{examRows.map((item) => <SelectItem value={item.id} key={item.id}>{item.title}</SelectItem>)}</SelectContent></Select></div>
          </div>
          {!examId ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Pilih ujian untuk mulai membuat soal.</div> : <>
            <div className="space-y-2"><Label>Pertanyaan</Label><RichTextEditor value={question} onChange={setQuestion} placeholder="Tulis pertanyaan; gunakan toolbar untuk format atau sisipkan gambar." /></div>
            <div className="space-y-2"><Label>Tipe jawaban</Label><Select value={type} onValueChange={(v) => { setType(v as typeof type); setCorrectAnswer('') }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiple_choice">Pilihan ganda</SelectItem><SelectItem value="true_false">Benar / Salah</SelectItem><SelectItem value="essay">Esai</SelectItem></SelectContent></Select></div>
            {type === 'essay' ? <div className="space-y-2"><Label>Pedoman jawaban</Label><RichTextEditor value={correctAnswer} onChange={setCorrectAnswer} placeholder="Tulis jawaban atau rubrik untuk penilaian esai." /></div> : <div className="space-y-3">{options.map((option, index) => <div className="space-y-2 rounded-2xl border border-border p-3" key={option.id}><div className="flex items-center justify-between gap-3"><Label>Pilihan {String.fromCharCode(65 + index)}</Label><Button type="button" size="xs" variant={correctAnswer === option.id ? 'default' : 'outline'} onClick={() => setCorrectAnswer(option.id)}>Jawaban benar</Button></div><RichTextEditor value={option.content} onChange={(content) => setOptions((all) => all.map((item) => item.id === option.id ? { ...item, content } : item))} placeholder={'Tulis pilihan ' + String.fromCharCode(65 + index)} /></div>)}{type === 'multiple_choice' && <Button type="button" variant="outline" onClick={() => setOptions((all) => [...all, emptyOption()])}><Plus /> Tambah pilihan</Button>}</div>}
            <div className="space-y-2"><Label>Pembahasan (opsional)</Label><RichTextEditor value={explanation} onChange={setExplanation} placeholder="Tambahkan pembahasan untuk reviewer atau hasil ujian." /></div>
            <Button type="button" size="lg" disabled={!canSave || createQuestion.isPending} onClick={() => createQuestion.mutate()}>{createQuestion.isPending ? 'Menyimpan…' : <><Save /> Simpan soal</>}</Button>
            {createQuestion.isError && <p className="text-sm text-destructive">Soal gagal disimpan. Periksa seluruh field lalu coba lagi.</p>}
          </>}
        </CardContent></Card>
        <Card className="border-border/60 bg-card/70"><CardHeader><CardTitle>Daftar soal</CardTitle><CardDescription>{activeExam ? `${activeExam.questions.length} soal pada ${activeExam.title}` : 'Pilih ujian untuk melihat seluruh soal dan pilihan jawabannya.'}</CardDescription></CardHeader><CardContent className="space-y-4">{!examId ? <div className="rounded-2xl bg-muted/40 p-6 text-sm text-muted-foreground"><Sparkles className="mb-2 size-5 text-primary" />Daftar soal akan tampil setelah ujian dipilih.</div> : activeExam?.questions.length ? activeExam.questions.map((item, index) => <article key={item.id} className="rounded-3xl border border-border bg-background/30 p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><span className="font-medium">Soal {index + 1}</span><Badge variant="secondary">{questionTypeLabel[item.type as keyof typeof questionTypeLabel] ?? item.type}</Badge></div><div className="prose prose-sm mt-3 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.question }} />{item.type === 'essay' ? <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/5 p-3"><p className="mb-2 text-sm font-medium text-accent">Pedoman jawaban</p>{item.correctAnswer ? <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.correctAnswer }} /> : <p className="text-sm text-muted-foreground">Belum ada pedoman jawaban.</p>}</div> : item.options?.length ? <ol className="mt-4 grid gap-2">{item.options.map((option, optionIndex) => { const isCorrect = option.id === item.correctAnswer; return <li key={option.id} className={isCorrect ? 'rounded-2xl border border-accent/30 bg-accent/10 p-3' : 'rounded-2xl border border-border/70 bg-muted/20 p-3'}><div className="flex items-start gap-3"><span className={isCorrect ? 'flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground' : 'flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground'}>{String.fromCharCode(65 + optionIndex)}</span><div className="min-w-0 flex-1"><div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: option.content }} />{isCorrect && <p className="mt-2 text-xs font-semibold text-accent">Jawaban benar</p>}</div></div></li> })}</ol> : null}{item.explanation && <details className="mt-4 rounded-2xl bg-muted/40 px-4 py-3"><summary className="cursor-pointer text-sm font-medium">Lihat pembahasan</summary><div className="prose prose-sm mt-3 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.explanation }} /></details>}</article>) : <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Belum ada soal pada ujian ini. Gunakan form di atas untuk menambahkan soal pertama.</div>}</CardContent></Card>
      </div>
    </>
  )
}

AdminQuestions.layout = adminPageLayout
