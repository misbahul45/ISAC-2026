# Auth and Registration Implementation Status

Dokumen ini mencatat implementasi aktual dari planning `00` sampai `07`. Jika contoh payload lama berbeda, kontrak canonical di dokumen ini dan `06-api-frontend-contract.md` menjadi acuan implementasi.

## Kontrak canonical

- Semua request JSON menggunakan `snake_case`.
- Semua response data menggunakan `camelCase`.
- Semua response memakai envelope `{ status, message, data, metadata, error }`.
- Mutation auth dan registration mengembalikan `redirectTo` di dalam `data` ketika navigasi diperlukan.
- `401` menghapus token frontend; `422` mengembalikan error per-field; `429` membawa `Retry-After` dan dipetakan menjadi countdown message.

## Authentication

Flow yang aktif:

1. `POST /api/auth/register`
2. `POST /api/auth/verify-email` dan `POST /api/auth/verify-email/resend`
3. Shared `POST /api/auth/login` untuk Team/Admin
4. `GET /api/auth/me` dan `POST /api/auth/logout`
5. `POST /api/auth/forgot-password`
6. `POST /api/auth/reset-password/verify`
7. `POST /api/auth/reset-password`

Token Sanctum disimpan pada `localStorage` melalui satu auth storage adapter. Session dipulihkan dengan `/api/auth/me`, dan header desktop/mobile menampilkan Login/Register untuk guest atau Dashboard/Logout untuk principal aktif.

Login Team yang belum terverifikasi mengirim ulang OTP email, mengembalikan token dengan `emailVerificationRequired: true`, dan mengarahkan frontend ke `/auth/verify-email`. Frontend menampilkan indikator loading selama transisi tersebut.

`AuthRouteMiddleware` mencegah principal aktif membuka kembali UI `/auth/*`. Pengecualian hanya untuk Team belum terverifikasi pada `/auth/verify-email`. Header auth menggunakan varian minimal berupa tombol Back dan logo resmi. Metadata default, Open Graph, Twitter card, favicon, dan JSON-LD menggunakan identitas ISAC 2026 serta aset `/public/logo.png`.

Halaman web 403, 404, 419, 429, 500, dan 503 memakai error experience bertema auth dengan Sound1–4, entrance/parallax GSAP, reduced-motion fallback, serta border portal berlapis. Error API tetap memakai envelope JSON dan tidak dirender sebagai halaman Inertia.

OTP dan reset token disimpan dalam bentuk hash, single-use, memiliki expiry dan attempt limit. Named rate limiter diterapkan per action. Security audit mencatat event auth, rate limit, dan authorization denial dengan IP yang di-hash serta tanpa credential atau token.

## Registration workflow

Frontend menggunakan context backend sebagai source of truth:

`COMPETITION → TEAM → BIODATA → DOCUMENTS → PAYMENT (Olympiad) → DASHBOARD`

- Olympiad: tepat satu Member dan pembayaran awal wajib.
- Business Plan/Business IT Case: dua sampai tiga Member, tanpa pembayaran awal.
- Semua mutation mengembalikan context terbaru dan `redirectTo`.
- Selection dan submit ulang dengan payload yang sama bersifat idempotent.
- Data yang sudah submit terkunci, kecuali phase yang diminta untuk revisi.
- Status menunggu, revisi, ditolak, terverifikasi, pembayaran, serta current Stage ditampilkan pada Team dashboard.

## Admin workflow

Backend menyediakan list/detail Team, verify/revision/reject data, verify/revision/reject payment, dan ordered Stage advancement. Policy mengikuti role matrix pada dokumen `05`; setiap perubahan domain admin disimpan pada `admin_audit_logs` beserta actor, before/after state, reason, dan request ID.

Admin dashboard saat ini adalah landing operasional dan session guard. Management UI admin berada di luar scope implementasi frontend ini; seluruh enforcement dan endpoint admin sudah berada di backend.

## File security

- Team hanya dapat mendaftarkan `PAYMENT_PROOF`, `MEMBER_PHOTO`, dan `SUBMISSION`.
- `super_admin`/`admin_registration` dapat mendaftarkan `BATCH_MODULE`.
- URL metadata harus menggunakan HTTPS dan host ImageKit yang dikonfigurasi.
- Foto Member dan bukti pembayaran harus dimiliki Team yang sedang login serta mempunyai purpose yang benar.
- File modul Batch harus mempunyai purpose `BATCH_MODULE`.

## Deterministic seed

`DatabaseSeeder` menjalankan `IsacDomainSeeder` secara idempotent. Seeder mengisi seluruh tabel domain: Admin, Team, auth challenge, Competition, Batch, Stage, File, Member, Registration, Submission, Exam, Question, Attempt, Answer, Event Log, dan Admin Audit Log. Tabel framework seperti cache, job, session, dan personal access token tidak diisi.

Password seluruh account seed adalah `password123`.

Admin seed:

- `superadmin@isac.test`
- `registration@isac.test`
- `payment@isac.test`
- `judge@isac.test`

Team seed menggunakan pola `{scenario}@team.isac.test`, dengan scenario `unverified`, `profile`, `payment`, `review`, `revision`, `verified`, `rejected`, dan `cancelled`. OTP seed untuk `unverified@team.isac.test` adalah `000000` dan hanya ditujukan untuk environment lokal.

## Docker workflow

Semua command project dijalankan melalui Docker:

```bash
docker compose up -d
docker exec isac2026-app php artisan migrate --seed --force
docker exec isac2026-app php artisan test
docker exec isac2026-app ./vendor/bin/pint --dirty
docker exec isac2026-app npm run typecheck
docker exec isac2026-app npm run build
```

Email runtime menggunakan SMTP produksi dari `.env`; Docker tidak mengoverride host atau credential mail dan tidak menjalankan mail catcher dummy. Untuk Brevo, isi `MAIL_USERNAME`, `MAIL_PASSWORD`, dan alamat sender terverifikasi pada `MAIL_FROM_ADDRESS`, lalu jalankan `docker exec isac2026-app php artisan config:clear`.

## Verification result

Quality gate yang wajib tetap hijau:

- MySQL dan SQLite fresh migration + deterministic seed.
- Backend Pest suite.
- Pint formatter.
- TypeScript typecheck.
- Vite production build.
- Docker Compose config validation.
