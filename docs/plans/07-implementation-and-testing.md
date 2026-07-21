# Implementation, Migration, and Testing Plan

## Prinsip delivery

- Implementasi dilakukan per vertical slice yang dapat diuji.
- Migration production tidak boleh mengasumsikan database kosong.
- Controller tetap tipis.
- State transition memiliki satu service resmi.
- Setiap fase harus lulus test sebelum fase berikutnya.
- Semua endpoint mengembalikan JSON dengan format standar `{status, message, data, metadata, error}`.

## Fase 1: Schema dan enum

Pekerjaan:

1. Tambahkan field Team: `school_province`, `school_city`, `verification_note`, `revision_step`.
2. Tambahkan field Member: `education_level`, `sort_order`, `photo_file_id`.
3. Tambahkan Registration: `team_completed_at`, `members_completed_at`, `documents_completed_at`, `submitted_at`, `payment_required_at`, `payment_submitted_at`, `payment_for_stage_id`.
4. Rename field Registration: `verified_by` → `payment_verified_by`, `verified_at` → `payment_verified_at`, `rejection_reason` → `payment_rejection_reason`.
5. Normalisasi Competition, Batch, Team, dan Registration enum.
6. Buat migration `create_auth_challenges_table`.
7. Perbaiki model: UUID, relations, timestamp casts.
8. Perbaiki Batch: ganti `createdAt`/`updatedAt` ke `created_at`/`updated_at` standar, tambah import SoftDeletes.

Verifikasi:

- Fresh migration.
- Migration dari schema existing.
- Preflight duplicate report.
- Foreign key dan unique index.
- Model cast test.

## Fase 2: Domain state services

Implementasikan service untuk setiap transaksi state:

- `RegistrationSelectionService` — pilih Competition & Batch.
- `FinalizeTeamPhaseService` — simpan data Team.
- `FinalizeMembersPhaseService` — finalisasi Member.
- `FinalizeDocumentsPhaseService` — simpan dokumen.
- `SubmitPaymentService` — submit bukti bayar.
- `VerifyTeamDataService` — Admin verifikasi data Team.
- `VerifyRegistrationPaymentService` — Admin verifikasi payment.
- `ActivateTeamStageService` — aktivasi Stage.
- `RequireStagePaymentService` — buka payment gate Semifinal.

Setiap service:

- Memiliki input typed/DTO.
- Memvalidasi transition.
- Menggunakan transaction bila menulis lebih dari satu record.
- Idempotent bila action mungkin dikirim ulang.
- Tidak bergantung pada frontend route.

## Fase 3: Sanctum token authentication

Implementasikan:

1. Admin model: tambahkan trait `Authenticatable`.
2. `POST /api/auth/register` — register Team + kirim OTP.
3. `POST /api/auth/send-verification` — kirim ulang OTP.
4. `POST /api/auth/verify-email` — verifikasi email.
5. `POST /api/auth/login` — shared login: deteksi Admin/Team, return token + principalType + redirectTo.
6. `POST /api/auth/logout` — hapus token.
7. `GET /api/auth/me` — data user login (Team atau Admin) + principalType.
8. `POST /api/auth/forgot-password` — lupa password.
9. `POST /api/auth/verify-code` — verifikasi OTP reset.
10. `POST /api/auth/change-password` — ganti password.
11. Simpan token frontend di localStorage + kirim Bearer header.

Yang perlu diperbaiki dari implementasi saat ini:

- Admin model: tambah `Authenticatable` + buat login endpoint Admin.
- `forgotPassword`: response jangan bocorkan email.
- `generateTeamCode`: gunakan lock untuk race condition.
- `AuthService`: ganti `password_reset_codes` dengan `auth_challenges` + hash OTP.

## Fase 4: Registration API endpoints

Implementasikan controller + route untuk:

1. `GET /api/competitions` — daftar Competition open.
2. `GET /api/registrations/me/context` — status registration.
3. `POST /api/registrations/me/selection` — pilih Competition & Batch.
4. `GET /api/registrations/me/team` — data Team.
5. `PATCH /api/registrations/me/team` — update Team.
6. `GET /api/registrations/me/members` — data Member.
7. `PUT /api/registrations/me/members` — finalisasi Member.
8. `GET /api/registrations/me/documents` — data dokumen.
9. `PATCH /api/registrations/me/documents` — update dokumen.
10. `GET /api/registrations/me/payment` — info pembayaran.
11. `POST /api/registrations/me/payment` — submit pembayaran.
12. `GET /api/registrations/me/summary` — ringkasan.
13. `POST /api/registrations/me/submit-verification` — submit final.

Buat `App\Http\Controllers\Api\RegistrationController` dan `App\Services\RegistrationService`.

## Fase 5: Frontend API layer + routing

1. **Interceptor token** di `resources/js/lib/api.ts`:
   - Baca token dari localStorage.
   - Set header `Authorization: Bearer {token}`.
   - Handle 401 → hapus token + redirect login.

2. **Login flow**: simpan token ke localStorage setelah sukses.

3. **Logout flow**: hapus token dari localStorage.

4. **RequireAuth component**: proteksi route frontend.

5. **Context resolver**: helper client-side untuk navigasi registration.

6. **Error handling 429**: parse Retry-After header.

## Fase 6: Security

Implementasikan:

- Named rate limiter.
- OTP/reset hash (auth_challenges).
- Attempt counter dan expiry.
- Generic account recovery response.
- Policies dan Gates.
- Scoped bindings.
- Admin role abilities.
- Auth and authorization audit events.

Lakukan security review sebelum membuka route Admin.

## Fase 7: Admin API

Urutan:

1. Admin login endpoint.
2. Competition CRUD.
3. Batch CRUD.
4. Team list/detail.
5. Data verification (verify, revision, reject).
6. Payment verification.
7. Stage qualification/payment gate.
8. Audit log.

Semua endpoint JSON API dengan Policy backend.

## Fase 8: File upload

Implementasikan:

- Provider auth endpoint (`/api/imagekit-auth`).
- File registration endpoint (`POST /api/files`).
- Host/purpose validation.
- Authorization untuk Team/Admin.
- Payment proof upload.
- Batch module upload.

## Unit test matrix

### Service

- Selection valid dan invalid.
- Team phase: validasi field, completion marker.
- Member: jumlah sesuai Competition, satu LEADER, upsert, soft delete.
- Documents: validasi Google Drive URL.
- Payment: hanya Olympiad, amount dari backend, concurrency.

### Status transition

- Valid transition berhasil.
- Invalid transition ditolak.
- Verify action idempotent.
- Stage activation hanya sekali.
- Auto-verification non-Olympiad.

## Feature test matrix

### Auth

- Register return JSON dengan data Team.
- Verify email dan resend.
- Shared login Team return `principalType: 'TEAM'` + token + redirectTo.
- Shared login Admin return `principalType: 'ADMIN'` + token + `/admin/dashboard`.
- Login Admin inactive ditolak (403).
- Login email ambigu (terdaftar di Team dan Admin) ditolak (409).
- Login dengan email belum verify ditolak.
- Logout hapus token.
- Forgot/reset password.
- Rate limit 429.
- Policy denial.

### Registration

- Selection valid dan invalid.
- Batch beda Competition ditolak.
- Batch closed/full/expired.
- Resume setiap fase setelah refresh.
- Team form validation.
- Member finalization per Competition.
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

## E2E scenarios

### Olympiad happy path

Register → OTP → selection (OLIMPIADE) → Team → 1 Member → Documents → Payment → Admin verify data + payment → Dashboard.

### Business Plan happy path

Register → OTP → selection (BUSINESS_PLAN) → Team → 2 Member → Documents (auto final) → Admin verify → Dashboard.

### Business IT Case happy path

Register → OTP → selection (BUSINESS_IT_CASE) → Team → 3 Member → Documents (auto final) → Admin verify → Dashboard.

### Recovery

- Refresh pada setiap halaman.
- Logout/login saat registration belum selesai.
- Forgot password lalu login kembali.

### Revision

- Team, Member, Document, Payment revision.

### Abuse

- Submit resource milik Team lain.
- Akses endpoint Admin dari Team guard.
- Rapid login/OTP/resend.
- Double submit.

## Quality gates

Sebelum merge:

- PHP lint.
- Formatter.
- Static analysis.
- Backend test suite.
- TypeScript typecheck.
- Frontend lint.
- Production build.
- Migration fresh.
- Route list review.
- Authorization test review.

Sebelum release:

- Backup database.
- Migration preflight.
- Queue worker dan mail configuration.
- Rate limiter store shared.
- HTTPS.
- Admin seed/account verification.
- Rollback dan forward-fix procedure.
- Monitoring error, queue, auth failure, dan 429 rate.

## Rollout

1. Deploy additive schema.
2. Deploy model/service compatible dengan field lama dan baru.
3. Backfill data.
4. Aktifkan Registration API endpoints.
5. Aktifkan Admin CRUD/verification.
6. Deploy frontend dengan token handler.
7. Hapus contract dan kolom lama setelah stabil.

## Acceptance criteria

Planning dianggap berhasil diimplementasikan jika:

- Register/login mengembalikan JSON dengan token.
- Satu endpoint login untuk Team dan Admin, backend deteksi `principalType`.
- Admin dan Team memakai guard Sanctum serta authorization yang benar.
- Rate limit auth teruji.
- Login ulang menggunakan token yang valid.
- Frontend mengelola navigasi berdasarkan response API (`redirectTo`).
- Ketiga Competition mengikuti jumlah Member dan payment flow yang benar.
- Non-Olympiad tidak melihat payment awal.
- Olympiad tidak masuk Stage sebelum data dan payment verified.
- Business Team tidak masuk Semifinal sebelum payment verified.
- Admin action memiliki actor dan audit.
- Tidak ada Team yang dapat mengubah resource Team lain.
- Semua test dan quality gate lulus.
