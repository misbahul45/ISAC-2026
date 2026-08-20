import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileUpload, type UploadedFile } from '@/components/shared/FileUpload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiClientError } from '@/lib/api'
import { parseInstitutionAddress, serializeInstitutionAddress, type InstitutionAddress } from '@/features/registrations/utils/institutionAddress'
import { useUpdateAdminTeam } from '../hooks/useAdmin'
import type { AdminMemberUpdatePayload, AdminTeamSummary, AdminTeamUpdatePayload } from '../types/adminTypes'

type TeamForm = Omit<AdminTeamUpdatePayload['team'], 'institution_address'> & {
  institution_address: InstitutionAddress
}

type EditForm = {
  team: TeamForm
  members: AdminMemberUpdatePayload[]
  documents: AdminTeamUpdatePayload['documents']
  reason: string
}

function buildForm(data: AdminTeamSummary): EditForm {
  const isOlympiad = data.registration?.competition.type === 'OLIMPIADE'

  return {
    team: {
      name: data.team.name ?? '',
      phone: data.team.phone ?? '',
      institution_name: data.team.institutionName ?? '',
      institution_address: parseInstitutionAddress(data.team.institutionAddress),
    },
    members: data.members.map((member) => ({
      id: member.id,
      name: member.name,
      role: isOlympiad ? 'LEADER' : member.role,
      email: member.email,
      major: member.major,
      faculty: member.faculty,
      student_id: member.studentId,
      photo_file_id: member.photoFileId,
      sort_order: member.sortOrder,
    })),
    documents: {
      document_url: data.team.documentUrl ?? '',
      twibbon_url: data.team.twibbonUrl ?? '',
    },
    reason: '',
  }
}

function photoReference(fileId: string | null | undefined): UploadedFile {
  if (!fileId) return null

  return {
    id: fileId,
    fileId,
    url: '',
    purpose: 'MEMBER_PHOTO',
    name: 'Foto tersimpan',
  }
}

export function AdminTeamEditDialog({
  data,
  open,
  onOpenChange,
}: {
  data: AdminTeamSummary
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const update = useUpdateAdminTeam(data.team.id)
  const [form, setForm] = useState<EditForm>(() => buildForm(data))
  const [localError, setLocalError] = useState('')
  const apiError = update.error instanceof ApiClientError ? update.error : null
  const competitionType = data.registration?.competition.type
  const isOlympiad = competitionType === 'OLIMPIADE'
  const isUniversity = competitionType === 'BUSINESS_IT_CASE'
  const maxMembers = isOlympiad ? 1 : 3
  const identityLabel = isUniversity ? 'NIM' : 'NISN'

  useEffect(() => {
    if (!open) return
    setForm(buildForm(data))
    setLocalError('')
    update.reset()
  }, [data, open])

  function resetError() {
    setLocalError('')
    update.reset()
  }

  function setTeamField<K extends keyof TeamForm>(key: K, value: TeamForm[K]) {
    setForm((current) => ({ ...current, team: { ...current.team, [key]: value } }))
    resetError()
  }

  function setDocumentField<K extends keyof EditForm['documents']>(key: K, value: EditForm['documents'][K]) {
    setForm((current) => ({ ...current, documents: { ...current.documents, [key]: value } }))
    resetError()
  }

  function setMemberField<K extends keyof AdminMemberUpdatePayload>(index: number, key: K, value: AdminMemberUpdatePayload[K]) {
    setForm((current) => ({
      ...current,
      members: current.members.map((member, memberIndex) => memberIndex === index ? { ...member, [key]: value } : member),
    }))
    resetError()
  }

  function addMember() {
    if (form.members.length >= maxMembers) return
    setForm((current) => ({
      ...current,
      members: [...current.members, {
        name: '',
        role: 'MEMBER',
        email: '',
        major: isUniversity ? '' : null,
        faculty: isUniversity ? '' : null,
        student_id: '',
        photo_file_id: null,
        sort_order: current.members.length + 1,
      }],
    }))
    resetError()
  }

  function removeMember(index: number) {
    setForm((current) => ({ ...current, members: current.members.filter((_, memberIndex) => memberIndex !== index) }))
    resetError()
  }

  async function submit() {
    if (!form.team.name.trim() || !form.team.phone.trim() || !form.team.institution_name.trim()) {
      setLocalError('Nama team, nomor telepon, dan institusi wajib diisi.')
      return
    }
    if (!form.team.institution_address.province.trim() || !form.team.institution_address.city.trim() || !form.team.institution_address.address.trim()) {
      setLocalError('Provinsi, kota/kabupaten, dan alamat institusi wajib diisi.')
      return
    }
    if (form.members.length !== maxMembers) {
      setLocalError(`Jumlah member harus tepat ${maxMembers} orang.`)
      return
    }

    const payload: AdminTeamUpdatePayload = {
      team: {
        name: form.team.name.trim(),
        phone: form.team.phone.trim(),
        institution_name: form.team.institution_name.trim(),
        institution_address: serializeInstitutionAddress(form.team.institution_address),
      },
      members: form.members.map((member, index) => ({
        ...member,
        name: member.name.trim(),
        email: member.email.trim(),
        major: isUniversity ? member.major?.trim() || null : null,
        faculty: isUniversity ? member.faculty?.trim() || null : null,
        student_id: member.student_id.trim(),
        photo_file_id: member.photo_file_id ?? null,
        sort_order: index + 1,
      })),
      documents: {
        document_url: form.documents.document_url.trim(),
        twibbon_url: form.documents.twibbon_url.trim(),
      },
      reason: form.reason.trim() || undefined,
    }

    try {
      await update.mutateAsync(payload)
      toast.success('Data team dan member berhasil diperbarui.')
      onOpenChange(false)
    } catch {
      // Pesan API ditampilkan di bawah form.
    }
  }

  const fieldError = (field: string) => apiError?.fields[field]?.[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit Data Pendaftaran</DialogTitle>
          <DialogDescription>Perubahan Admin langsung disimpan ke data team, member, dan dokumen. Semua perubahan tercatat pada audit log.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Card className="border-border/60 bg-background/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Profil Team</CardTitle>
              <CardDescription>Data identitas utama yang digunakan pada pendaftaran.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">Nama team<Input value={form.team.name} onChange={(event) => setTeamField('name', event.target.value)} aria-invalid={Boolean(fieldError('team.name'))} />{fieldError('team.name') && <span className="text-xs text-destructive">{fieldError('team.name')}</span>}</label>
              <label className="space-y-1.5 text-sm">Nomor telepon<Input value={form.team.phone} onChange={(event) => setTeamField('phone', event.target.value)} aria-invalid={Boolean(fieldError('team.phone'))} />{fieldError('team.phone') && <span className="text-xs text-destructive">{fieldError('team.phone')}</span>}</label>
              <label className="space-y-1.5 text-sm sm:col-span-2">Sekolah / institusi<Input value={form.team.institution_name} onChange={(event) => setTeamField('institution_name', event.target.value)} aria-invalid={Boolean(fieldError('team.institution_name'))} />{fieldError('team.institution_name') && <span className="text-xs text-destructive">{fieldError('team.institution_name')}</span>}</label>
              <label className="space-y-1.5 text-sm">Provinsi<Input value={form.team.institution_address.province} onChange={(event) => setTeamField('institution_address', { ...form.team.institution_address, province: event.target.value })} /></label>
              <label className="space-y-1.5 text-sm">Kota / kabupaten<Input value={form.team.institution_address.city} onChange={(event) => setTeamField('institution_address', { ...form.team.institution_address, city: event.target.value })} /></label>
              <label className="space-y-1.5 text-sm sm:col-span-2">Alamat lengkap<Textarea value={form.team.institution_address.address} onChange={(event) => setTeamField('institution_address', { ...form.team.institution_address, address: event.target.value })} /></label>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/30">
            <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
              <div><CardTitle className="text-sm">Member Team ({form.members.length})</CardTitle><CardDescription>{isUniversity ? 'Kompetisi mahasiswa menggunakan NIM, jurusan, dan fakultas.' : 'Kompetisi siswa menggunakan NISN.'}</CardDescription></div>
              {!isOlympiad && <Button type="button" variant="outline" size="sm" onClick={addMember} disabled={form.members.length >= maxMembers}><Plus />Tambah Member</Button>}
            </CardHeader>
            <CardContent className="space-y-4">
              {form.members.map((member, index) => (
                <div key={member.id ?? `new-${index}`} className="space-y-4 rounded-3xl border border-border/60 bg-background/30 p-4">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">Member {index + 1}</p><p className="text-xs text-muted-foreground">{member.photo_file_id ? 'Foto tersimpan dan dapat diganti.' : 'Foto peserta opsional.'}</p></div><Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={() => removeMember(index)} disabled={form.members.length <= 1} aria-label={`Hapus member ${index + 1}`}><Trash2 /></Button></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm">Nama lengkap<Input value={member.name} onChange={(event) => setMemberField(index, 'name', event.target.value)} aria-invalid={Boolean(fieldError(`members.${index}.name`))} />{fieldError(`members.${index}.name`) && <span className="text-xs text-destructive">{fieldError(`members.${index}.name`)}</span>}</label>
                    <label className="space-y-1.5 text-sm">Peran<select disabled={isOlympiad} value={isOlympiad ? 'LEADER' : member.role} onChange={(event) => setMemberField(index, 'role', event.target.value as AdminMemberUpdatePayload['role'])} className="h-9 w-full rounded-3xl border border-input bg-input/50 px-3 text-sm disabled:opacity-60"><option value="LEADER">Ketua</option><option value="MEMBER">Anggota</option></select></label>
                    <label className="space-y-1.5 text-sm">Email<Input type="email" value={member.email} onChange={(event) => setMemberField(index, 'email', event.target.value)} aria-invalid={Boolean(fieldError(`members.${index}.email`))} />{fieldError(`members.${index}.email`) && <span className="text-xs text-destructive">{fieldError(`members.${index}.email`)}</span>}</label>
                    <label className="space-y-1.5 text-sm">{identityLabel}<Input value={member.student_id} onChange={(event) => setMemberField(index, 'student_id', event.target.value)} aria-invalid={Boolean(fieldError(`members.${index}.student_id`))} />{fieldError(`members.${index}.student_id`) && <span className="text-xs text-destructive">{fieldError(`members.${index}.student_id`)}</span>}</label>
                    <label className="space-y-1.5 text-sm">Jurusan<Input disabled={!isUniversity} value={member.major ?? ''} onChange={(event) => setMemberField(index, 'major', event.target.value)} placeholder={isUniversity ? 'Masukkan jurusan' : 'Tidak berlaku untuk kompetisi siswa'} aria-invalid={Boolean(fieldError(`members.${index}.major`))} />{fieldError(`members.${index}.major`) && <span className="text-xs text-destructive">{fieldError(`members.${index}.major`)}</span>}</label>
                    <label className="space-y-1.5 text-sm">Fakultas<Input disabled={!isUniversity} value={member.faculty ?? ''} onChange={(event) => setMemberField(index, 'faculty', event.target.value)} placeholder={isUniversity ? 'Masukkan fakultas' : 'Tidak berlaku untuk kompetisi siswa'} aria-invalid={Boolean(fieldError(`members.${index}.faculty`))} />{fieldError(`members.${index}.faculty`) && <span className="text-xs text-destructive">{fieldError(`members.${index}.faculty`)}</span>}</label>
                    <div className="space-y-1.5 text-sm sm:col-span-2"><p>Foto peserta</p><FileUpload value={photoReference(member.photo_file_id)} onChange={(value) => setMemberField(index, 'photo_file_id', value?.id ?? null)} folder="/member-photos" purpose="MEMBER_PHOTO" label="Upload / ganti foto" subLabel="JPG, PNG, atau WebP maksimal 5 MB" accept="image/png,image/jpeg,image/webp" maxSizeMB={5} /></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/30">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Dokumen</CardTitle><CardDescription>Link Google Drive yang digunakan pada verifikasi pendaftaran.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">Link folder dokumen<Input type="url" value={form.documents.document_url} onChange={(event) => setDocumentField('document_url', event.target.value)} aria-invalid={Boolean(fieldError('documents.document_url'))} />{fieldError('documents.document_url') && <span className="text-xs text-destructive">{fieldError('documents.document_url')}</span>}</label>
              <label className="space-y-1.5 text-sm">Link folder twibbon<Input type="url" value={form.documents.twibbon_url} onChange={(event) => setDocumentField('twibbon_url', event.target.value)} aria-invalid={Boolean(fieldError('documents.twibbon_url'))} />{fieldError('documents.twibbon_url') && <span className="text-xs text-destructive">{fieldError('documents.twibbon_url')}</span>}</label>
            </CardContent>
          </Card>

          <label className="space-y-1.5 text-sm">Catatan perubahan (opsional)<Textarea value={form.reason} onChange={(event) => { setForm((current) => ({ ...current, reason: event.target.value })); resetError() }} placeholder="Contoh: koreksi NISN berdasarkan konfirmasi pendaftar." maxLength={2000} /><span className="block text-right text-xs text-muted-foreground">{form.reason.length}/2000</span></label>
        </div>

        {(localError || update.error) && <p className="rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{localError || apiError?.message || 'Data tidak dapat disimpan.'}</p>}
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button><Button onClick={submit} disabled={update.isPending}>{update.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
