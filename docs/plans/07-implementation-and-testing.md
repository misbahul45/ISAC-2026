# Implementation, Migration, and Testing Plan

## Prinsip delivery

- Implementasi dilakukan per vertical slice yang dapat diuji.
- Migration production tidak boleh mengasumsikan database kosong.
- Controller tetap tipis.
- State transition memiliki satu service resmi.
- UI mock dihapus hanya setelah backend penggantinya tersedia.
- Setiap fase harus lulus test sebelum fase berikutnya.

## Fase 1: Schema dan enum

Pekerjaan:

1. Tambahkan field Team address dan revision.
2. Tambahkan field Member education_level dan sort_order.
3. Tambahkan Registration progress/payment fields.
4. Rename verification field Registration menjadi payment-specific.
5. Normalisasi Competition, Batch, Team, dan Registration enum.
6. Buat auth_challenges.
7. Perbaiki model UUID, relations, timestamp, dan casts.

Verifikasi:

- Fresh migration.
- Migration dari schema existing.
- Preflight duplicate report.
- Foreign key dan unique index.
- Model cast test.

## Fase 2: Domain state services

Implementasikan:

- RegistrationSelectionService.
- FinalizeTeamPhaseService.
- FinalizeMembersPhaseService.
- FinalizeDocumentsPhaseService.
- SubmitPaymentService.
- VerifyTeamDataService.
- VerifyRegistrationPaymentService.
- ActivateTeamStageService.
- RequireStagePaymentService.
- TeamNextRouteResolver.

Setiap service:

- Memiliki input typed/DTO.
- Memvalidasi transition.
- Menggunakan transaction bila menulis lebih dari satu record.
- Idempotent bila action mungkin dikirim ulang.
- Tidak bergantung pada frontend route.

## Fase 3: Session authentication

Implementasikan:

1. Team dan Admin provider.
2. Guard team dan admin.
3. Model Authenticatable.
4. Shared login endpoint.
5. Register Team.
6. Verify/resend email.
7. Logout.
8. Forgot/reset password.
9. Session regeneration dan revocation.
10. Redirect response Inertia.

Bearer auth existing dipertahankan sementara hanya jika endpoint JSON masih menggunakannya. Jangan menghapus sebelum dependency audit selesai.

## Fase 4: Security

Implementasikan:

- Named rate limiter.
- OTP/reset hash.
- Attempt counter dan expiry.
- Generic account recovery response.
- CSRF coverage.
- Policies dan Gates.
- Scoped bindings.
- Admin role abilities.
- Auth and authorization audit events.
- Open redirect prevention.

Lakukan security review sebelum membuka route Admin.

## Fase 5: Backend redirect control

Implementasikan resolver dan middleware.

Terapkan bertahap:

1. Root dan guest auth pages.
2. Login dan verify email.
3. Registration GET.
4. Registration mutations.
5. Dashboard.
6. Semifinal payment gate.

Tambahkan observability untuk state inconsistency dan redirect loop.

## Fase 6: Registration web flow

Urutan halaman:

1. Competition dan Batch dari DB.
2. Team phase.
3. Member phase dinamis.
4. Documents.
5. Payment conditional.
6. Waiting, revision, rejected, dan waiting activation.

Hapus:

- Hard-coded Competition.
- Hard-coded BUSINESS_IT_CASE.
- Hard-coded tiga Member.
- Simulasi setTimeout.
- Persistence utama localStorage.
- Mock TeamAccount payment.
- Static amount dan promo yang belum didukung.

## Fase 7: Admin

Urutan:

1. Admin login/dashboard.
2. Competition CRUD.
3. Batch CRUD.
4. Team list/detail.
5. Data verification.
6. Payment verification.
7. Stage qualification/payment gate.
8. Audit viewer.

Semua menu frontend mengikuti ability, tetapi Policy backend tetap authoritative.

## Fase 8: File upload

Implementasikan:

- Provider auth endpoint.
- File registration endpoint.
- Host/purpose validation.
- Authorization untuk Team/Admin.
- Payment proof upload.
- Batch module upload.
- Cleanup orphan external files jika diperlukan.

File API tetap JSON karena upload asynchronous.

## Unit test matrix

### Resolver

- Semua completion marker.
- Semua Team status.
- Semua Registration status.
- Revision step.
- Initial dan Semifinal payment.
- Missing Stage dan inconsistent state.

### Status transition

- Valid transition berhasil.
- Invalid transition ditolak.
- Verify action idempotent.
- Stage activation hanya sekali.
- Auto-verification non-Olympiad.

### Member rules

- Olympiad satu.
- Olympiad lebih dari satu ditolak.
- Non-Olympiad satu ditolak.
- Non-Olympiad dua dan tiga diterima.
- Lebih dari tiga ditolak.
- Tanpa leader atau dua leader ditolak.

## Feature test matrix

### Auth

- Register redirect verify email.
- Verify dan resend.
- Login Admin dan Team.
- Login belum verify.
- Logout.
- Forgot/reset.
- Rate limit.
- Session fixation.
- Guard isolation.
- Policy denial.

### Registration

- Selection valid dan invalid.
- Batch beda Competition.
- Batch closed/full/expired.
- Resume setiap fase setelah refresh.
- Direct URL canonical redirect.
- Team form validation.
- Member finalization.
- Document Google Drive validation.
- Olympiad payment.
- Non-Olympiad bypass payment.
- Revision data/payment.
- Activation setelah dua gate verified.
- Semifinal payment.

### Admin

- CRUD Competition/Batch.
- Transition status.
- Authorization matrix.
- Verify/revision/reject.
- Stage advance.
- Audit log.

## Browser/E2E scenarios

### Olympiad happy path

Register, OTP, selection, Team, satu Member, Documents, Payment, Admin data/payment verify, lalu dashboard/Exam.

### Business Plan happy path

Register, OTP, selection, Team, dua Member, Documents, tanpa Payment, Admin verify, lalu dashboard/Submission.

### Business IT Case happy path

Sama seperti Business Plan dengan tiga Member.

### Recovery

- Refresh pada setiap halaman.
- Logout/login saat registration belum selesai.
- Forgot password lalu login kembali ke canonical route.
- OTP resend dan expired.

### Revision

- Team revision.
- Member revision.
- Document revision.
- Payment revision.

### Abuse

- Direct URL future step.
- Submit resource milik Team lain.
- Admin route dari Team guard.
- Rapid login/OTP/resend.
- Double submit.

## Quality gates

Sebelum merge:

- PHP lint.
- Formatter.
- Static analysis jika tersedia.
- Backend test suite.
- TypeScript typecheck.
- Frontend lint.
- Production build.
- Migration fresh.
- Migration upgrade dari snapshot schema existing.
- Route list review.
- Authorization test review.

Sebelum release:

- Backup database.
- Migration preflight.
- Queue worker dan mail configuration.
- Session/cache store production.
- Rate limiter store shared.
- HTTPS dan secure cookie.
- Admin seed/account verification.
- Rollback dan forward-fix procedure.
- Monitoring error, queue, auth failure, dan 429 rate.

## Rollout

1. Deploy additive schema.
2. Deploy model/service compatible dengan field lama dan baru.
3. Backfill data.
4. Aktifkan session auth.
5. Aktifkan resolver dalam logging-only mode jika diperlukan.
6. Migrasikan UI per fase.
7. Aktifkan canonical middleware.
8. Aktifkan Admin CRUD/verification.
9. Hapus contract dan kolom lama setelah stabil.

## Acceptance criteria

Planning dianggap berhasil diimplementasikan jika:

- Login/register web tidak mengembalikan JSON.
- Admin dan Team memakai guard serta authorization yang benar.
- Rate limit auth teruji.
- Refresh atau login ulang selalu kembali ke posisi yang benar.
- Client tidak menghitung next route.
- Ketiga Competition mengikuti jumlah Member dan payment flow yang benar.
- Non-Olympiad tidak melihat payment awal.
- Olympiad tidak masuk Stage sebelum data dan payment verified.
- Business Team tidak masuk Semifinal sebelum payment verified.
- Admin action memiliki actor dan audit.
- Tidak ada Team yang dapat mengubah resource Team lain.
- Semua test dan quality gate lulus.

## Keputusan yang harus dikunci sebelum implementasi

- Daftar field Member yang wajib per Competition.
- Kebijakan satu email Member boleh ikut lebih dari satu Team/event atau tidak.
- Apakah photo_file_id tetap digunakan.
- Storage session production: database atau Redis.
- Role Admin final.
- Provider upload dan whitelist hostname.
- Bentuk payment instructions dan metode pembayaran.
- Apakah promo dihapus atau akan dibuat sebagai domain baru.

