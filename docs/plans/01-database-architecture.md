# Database Architecture Plan

## Sasaran

Schema harus dapat menjawab secara independen:

1. Apakah email Team sudah diverifikasi?
2. Sampai fase mana Registration sudah diselesaikan?
3. Apakah data Team sudah diverifikasi Admin?
4. Apakah payment gate sudah terpenuhi?

Satu field status tidak boleh menjawab seluruh pertanyaan tersebut.

## Team

Team menyimpan identitas akun, data institusi, URL dokumen, status verifikasi data, dan Stage aktif.

### Field

- id (UUID), code, email, password, email_verified_at.
- name, phone, institution_name, institution_address (JSON string berisi province, city, address).
- document_url, twibbon_url.
- current_stage_id.
- status, verified_by, verified_at.
- verification_note, nullable text untuk alasan revisi atau penolakan.
- revision_step, nullable enum TEAM, MEMBERS, DOCUMENTS.
- timestamps dan soft delete.

### Status Team

| Status | Makna |
|---|---|
| INCOMPLETE | Registration belum final disubmit |
| WAITING_VERIFICATION | Data lengkap dan menunggu Admin |
| VERIFIED | Data Team dan Member diterima Admin |
| REVISION_REQUIRED | Admin meminta perbaikan |
| REJECTED | Data ditolak final |

Email verification tidak mengubah Team.status. Email verification hanya mengisi email_verified_at.

### Aturan

- code unique dan dibuat dengan generator yang aman terhadap race condition.
- email unique pada teams.
- Service pembuatan Team/Admin mencegah email yang sama terdapat pada kedua tabel.
- document_url dan twibbon_url harus berupa URL Google Drive.
- verified_by wajib null kecuali status berasal dari Admin.
- revision_step wajib terisi saat REVISION_REQUIRED.
- verification_note wajib terisi saat REVISION_REQUIRED atau REJECTED.

## Member

### Relasi

Team memiliki satu-ke-banyak Member.

### Field

- id (UUID), team_id.
- name, role, email.
- major dan faculty untuk peserta mahasiswa; null untuk peserta SMA/SMK/MA.
- student_id menyimpan NISN atau NIM sesuai Competition.
- photo_file_id nullable karena foto peserta opsional.
- sort_order.
- timestamps dan soft delete.

### Perubahan

- Model Member menggunakan UUID generation.
- Tambahkan sort_order untuk Ketua, Anggota 1, dan Anggota 2.
- Normalisasi role menjadi LEADER dan MEMBER.
- Data nomor telepon hanya disimpan pada Team; Member tidak menyimpan phone, education_level, atau birth_date.
- Pertahankan unique email global pada tahap awal agar satu peserta tidak berada di dua Team aktif.

### Constraint domain

Constraint berikut ditegakkan dalam service transaction:

- OLIMPIADE tepat satu Member.
- BUSINESS_PLAN tepat tiga Member.
- BUSINESS_IT_CASE tepat tiga Member.
- BUSINESS_PLAN dan BUSINESS_IT_CASE tepat satu LEADER.
- Member tunggal OLIMPIADE dinormalisasi sebagai LEADER oleh backend tanpa pilihan ketua pada UI.
- sort_order unique dalam satu Team.
- Semua Member pada request harus milik Team authenticated.

Fase Member hanya selesai setelah user menekan finalisasi. Backend memastikan BUSINESS_PLAN dan BUSINESS_IT_CASE memiliki tepat tiga Member, sedangkan OLIMPIADE tepat satu Member.

## Registration

Registration menghubungkan Team, Competition, dan Batch; menyimpan progress onboarding; serta menyimpan payment gate.

### Field inti

- id (UUID), team_id, competition_id, batch_id.
- status.
- payment_proof_file_id.
- amount_paid, payment_method, paid_at.
- promo_code, discount_percent, discount_amount sebagai snapshot promo saat pembayaran disubmit.
- payment_required_at, payment_submitted_at.
- payment_verified_by, payment_verified_at.
- payment_rejection_reason.
- payment_for_stage_id.
- team_completed_at.
- members_completed_at.
- documents_completed_at.
- submitted_at.
- metadata.
- timestamps dan soft delete.

### Rename

- verified_by menjadi payment_verified_by.
- verified_at menjadi payment_verified_at.
- rejection_reason menjadi payment_rejection_reason.

Nama baru memperjelas bahwa field tersebut hanya untuk pembayaran.

### Progress marker

| Field | Makna |
|---|---|
| team_completed_at | Form Team valid dan tersimpan |
| members_completed_at | Semua Member telah difinalisasi |
| documents_completed_at | URL dokumen dan twibbon valid |
| submitted_at | Seluruh Registration dikirim untuk verifikasi |

Progress marker berada pada Registration, bukan Team.status.

### Status pembayaran

| Status | Makna |
|---|---|
| WAITING_PAYMENT | Pembayaran diwajibkan tetapi bukti belum dikirim |
| WAITING_VERIFICATION | Bukti pembayaran sudah dikirim |
| VERIFIED | Payment gate terpenuhi oleh sistem atau Admin |
| REVISION_REQUIRED | Bukti perlu diperbaiki |
| REJECTED | Pembayaran ditolak final |
| CANCELLED | Registration dibatalkan |

NOT_REQUIRED dihapus. Business Plan dan Business IT Case langsung VERIFIED untuk payment gate awal.

### Status awal

- OLIMPIADE: WAITING_PAYMENT.
- BUSINESS_PLAN: VERIFIED, payment_verified_at terisi dan payment_verified_by null.
- BUSINESS_IT_CASE: VERIFIED, payment_verified_at terisi dan payment_verified_by null.

payment_verified_by null dengan payment_verified_at terisi berarti auto-verification oleh sistem.

### Constraint

- team_id unique.
- Batch harus berasal dari Competition yang sama; divalidasi service.
- payment_proof_file_id nullable.
- payment_for_stage_id nullable untuk pembayaran awal dan diisi untuk gate Stage.
- submitted_at tidak boleh terisi sebelum fase wajib lengkap.
- Amount tidak pernah dipercaya dari client.

## File

File tetap hanya memiliki:

- id sebagai UUID database.
- file_id sebagai ID provider.
- url sebagai URL provider.

File digunakan untuk bukti pembayaran, module Batch, Submission, dan foto Member jika dipakai. Team document dan twibbon berupa URL Google Drive langsung dan tidak menggunakan File.

## Competition

### Field

- id (UUID), name, slug, description.
- type, payment_flow.
- start_date, end_date, status.
- timestamps dan soft delete.

### Normalisasi enum

- type: OLIMPIADE, BUSINESS_PLAN, BUSINESS_IT_CASE.
- payment_flow: UPFRONT, SEMIFINAL.
- status: DRAFT, REGISTRATION_OPEN, REGISTRATION_CLOSED, ONGOING, COMPLETED.

Hindari campuran lowercase di DB dan uppercase di frontend.

### Constraint

- slug unique.
- end_date setelah start_date.
- Competition yang memiliki Registration tidak boleh hard delete.
- Jika satu event hanya memiliki satu Competition per jenis, type dibuat unique pada data aktif melalui validasi service.

## Batch

### Field

- id (UUID), competition_id.
- name, slug, description.
- start_date, end_date, price.
- module_file_id.
- quota, current_registrations.
- status.
- timestamps dan soft delete.

### Perbaikan model

- Gunakan timestamp Laravel standar (created_at, updated_at), bukan camelCase.
- Perbaiki import SoftDeletes.
- Cast start_date dan end_date ke datetime.
- Status canonical: DRAFT, OPEN, CLOSED, FULL.

### Constraint

- Batch wajib memiliki Competition.
- end_date setelah start_date.
- price tidak negatif.
- quota null berarti tidak terbatas.
- Batch dapat dipilih hanya jika OPEN dan dalam rentang waktu.
- slug unique per Competition.

current_registrations adalah cache counter. Perubahannya dilakukan dalam transaction dengan row lock. Count aktual Registration tetap menjadi sumber audit.

## Auth challenge

Tabel auth_challenges menggantikan skema ad-hoc password_reset_codes.

### Field

- id.
- account_type: TEAM atau ADMIN.
- account_id.
- purpose: VERIFY_EMAIL atau RESET_PASSWORD.
- code_hash.
- reset_token_hash.
- attempt_count.
- sent_at, expired_at, verified_at, used_at.
- timestamps.

### Aturan

- OTP dan reset token tidak disimpan plaintext.
- Challenge baru menginvalidasi challenge aktif sebelumnya untuk account dan purpose yang sama.
- Challenge single use.
- attempt_count dibatasi.
- Record expired dibersihkan scheduled job.

## Stage activation

Team mendapat current_stage_id hanya jika:

- Registration.submitted_at terisi.
- Team.status VERIFIED.
- Registration.status VERIFIED.

Service activation memilih Stage pertama berdasarkan order dalam Competition. Operasi idempotent dan transactional.

## Pembayaran Semifinal

Saat Business Plan atau Business IT Case lolos menuju Semifinal:

- current_stage_id tetap pada Stage sebelumnya.
- Registration.status menjadi WAITING_PAYMENT.
- payment_required_at diisi.
- payment_for_stage_id menunjuk Semifinal.
- payment proof dan field verification dikosongkan.

Setelah pembayaran VERIFIED, service memindahkan current_stage_id ke payment_for_stage_id.

## Strategi migrasi

1. Tambahkan kolom baru secara nullable.
2. Backfill enum dan data existing.
3. Backfill progress berdasarkan kelengkapan aktual.
4. Audit duplicate Registration dan Member.
5. Rename field pembayaran.
6. Tambahkan index dan constraint.
7. Ubah menjadi non-null setelah data valid.
8. Deploy model dan service baru.
9. Hapus kolom lama dalam migration terpisah setelah satu release stabil.

Migration data-normalizing harus menyediakan preflight report untuk record yang tidak dapat dipetakan otomatis.
