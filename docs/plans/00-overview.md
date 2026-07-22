# ISAC 2026 API Architecture Plan

## Tujuan

Folder ini menjadi sumber rencana implementasi untuk:

- Authentication Team dan Admin berbasis token Sanctum.
- Authorization dan guard terpisah untuk Team dan Admin.
- Rate limiting untuk seluruh flow authentication.
- Registration Team dengan progress yang dikendalikan backend.
- CRUD Competition dan Batch.
- Verifikasi data Team dan pembayaran oleh Admin.
- Frontend menentukan navigasi berdasarkan response API.
- Seluruh komunikasi frontend-backend melalui JSON API.

Dokumen ini adalah planning. Implementasi aplikasi belum dianggap selesai hanya karena tercantum di sini.

## Prinsip arsitektur

1. Frontend mengelola state navigasi sendiri berdasarkan response API.
2. Backend hanya mengembalikan data dan redirectTo sebagai petunjuk, bukan paksa redirect HTTP.
3. Team.status hanya menyatakan status verifikasi data.
4. Registration.status hanya menyatakan status payment gate.
5. Verifikasi email disimpan pada Team.email_verified_at.
6. Progress wizard disimpan terpisah dari kedua status.
7. Seluruh komunikasi menggunakan JSON API dengan format response standar.
8. Perubahan status, progress, kuota, dan Stage dilakukan melalui service transaction.
9. Tindakan Admin wajib melewati authentication, authorization, dan audit.

## Flow utama Team

1. Team membuat akun menggunakan email dan password.
2. Sistem mengirim OTP verifikasi email.
3. Team memverifikasi email.
4. Team memilih Competition dan Batch.
5. Team melengkapi data Team.
6. Team membuat seluruh Member.
7. Team mengisi URL dokumen dan twibbon.
8. Olympiad mengunggah bukti pembayaran.
9. Business Plan dan Business IT Case melewati pembayaran awal.
10. Admin memverifikasi data Team.
11. Untuk Olympiad, Admin juga memverifikasi pembayaran.
12. Jika semua gate terpenuhi, backend memasukkan Team ke Stage awal.

## Perbedaan competition

| Competition | Jumlah Member | Pembayaran awal | Registration status awal |
|---|---:|---|---|
| OLIMPIADE | Tepat 1 | Wajib | WAITING_PAYMENT |
| BUSINESS_PLAN | Tepat 3 | Tidak ada | VERIFIED |
| BUSINESS_IT_CASE | Tepat 3 | Tidak ada | VERIFIED |

Business Plan dan Business IT Case baru menggunakan UI pembayaran ketika Team dinyatakan lolos menuju Semifinal.

## Dokumen planning

- 01-database-architecture.md: schema, constraints, dan state.
- 02-authentication-authorization.md: Sanctum token, guards, authorization, OTP, password reset, dan rate limiting.
- 03-team-registration-flow.md: seluruh flow Registration Team via JSON API.
- 04-frontend-routing.md: client-side routing, redirectTo, dan state navigasi.
- 05-competition-batch-admin.md: CRUD Competition, Batch, dan verifikasi Admin via JSON API.
- 06-api-frontend-contract.md: request, response, format JSON, dan mapping API.
- 07-implementation-and-testing.md: urutan implementasi, test matrix, rollout, dan acceptance criteria.
- 08-implementation-status.md: kontrak canonical, status implementasi, seed, dan command verifikasi Docker.
- 09-admin-dashboard-ui.md: arsitektur UI Admin, sidebar responsif, matriks role, mapping API, dan gap endpoint.
- 09-admin-dashboard-ui.md: arsitektur UI Admin, sidebar responsif, matriks role, mapping API, dan gap endpoint.

## Batasan awal

- Satu Team hanya boleh memiliki satu Registration.
- Satu Registration memilih satu Competition dan satu Batch.
- Batch harus berasal dari Competition yang dipilih.
- Team yang sudah submit tidak boleh mengganti Competition atau Batch sendiri.
- Harga pembayaran selalu dihitung backend dari Batch.
- document_url dan twibbon_url adalah URL Google Drive langsung.
- Bukti pembayaran menggunakan File sebagai metadata external file.
- Competition type memakai satu representasi canonical di seluruh layer.

## Canonical enum

Competition type:

- OLIMPIADE
- BUSINESS_PLAN
- BUSINESS_IT_CASE

Payment flow:

- UPFRONT
- SEMIFINAL

Team verification status:

- INCOMPLETE
- WAITING_VERIFICATION
- VERIFIED
- REVISION_REQUIRED
- REJECTED

Registration payment status:

- WAITING_PAYMENT
- WAITING_VERIFICATION
- VERIFIED
- REVISION_REQUIRED
- REJECTED
- CANCELLED
