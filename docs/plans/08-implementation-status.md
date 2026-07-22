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
- Business Plan/Business IT Case: tepat tiga Member, tanpa pembayaran awal.
- Semua mutation mengembalikan context terbaru dan `redirectTo`.
- Selection dan submit ulang dengan payload yang sama bersifat idempotent.
- Data yang sudah submit terkunci, kecuali phase yang diminta untuk revisi.
- Status menunggu, revisi, ditolak, terverifikasi, pembayaran, serta current Stage ditampilkan pada Team dashboard.

### User dashboard guard

- `/dashboard` hanya merender dashboard Team ketika context registrasi sudah berada pada `DASHBOARD`.
- Session `/api/auth/me` mengirim `nextRedirect` berdasarkan data progres aktual, bukan hanya status Team.
- Team yang belum lengkap diarahkan ke posisi aktual: competition, team, biodata, documents, atau payment.
- Guard frontend menutup akses guest dan Admin ke dashboard Team; Admin tetap diarahkan ke `/admin/dashboard`.
- Dashboard memakai context summary sebagai pemeriksaan kedua agar cache sesi yang lama tidak dapat menampilkan konten sebelum redirect.
- Header global disembunyikan hanya pada `/dashboard`; tampilan `/admin/dashboard` tidak diubah.

### Registration profile contract

- Seluruh `/registration/*` tidak menampilkan Header global agar fokus pada workflow.
- Kartu kompetisi hanya menampilkan judul, deskripsi sasaran peserta, dan aksi Register. Olimpiade serta Business Plan untuk SMA/SMK/MA; Business IT Case untuk mahasiswa.
- Fase Team meminta nama tim, nama sekolah/perguruan tinggi, satu nomor telepon tim, provinsi, kota/kabupaten, dan alamat lengkap.
- Tiga field alamat ditampilkan di kolom kanan pada desktop dan ditumpuk responsif pada layar kecil; backend menyimpannya dalam satu `institution_address` JSON string.
- Business Plan dan Business IT Case langsung menampilkan tiga slot biodata tetap tanpa tombol tambah/hapus anggota.
- Biodata berubah berdasarkan Competition: NISN untuk siswa, NIM + jurusan + fakultas untuk mahasiswa, tanpa jenjang pendidikan, nomor telepon peserta, atau tanggal lahir.
- Foto peserta opsional dan peserta Olimpiade tidak diberi label Ketua Tim.
- React Hook Form memakai validasi onChange dengan error per field; NISN/NIM disimpan sebagai string 3–50 karakter dan tidak dipaksa numeric.

### Payment promo contract

- Input ID transaksi dihapus dari UI, request API, model, dan schema database.
- Form pembayaran menyediakan kode promo opsional dengan validasi onChange melalui endpoint quote.
- Kode promo berasal dari environment; konfigurasi aktif `ISAXOP` memberi diskon 15% dari harga Batch aktif.
- Database menyimpan kode, persentase, nominal diskon, dan total final sebagai snapshot pembayaran.

## Admin workflow

Backend menyediakan list/detail Team, verify/revision/reject data, verify/revision/reject payment, dan ordered Stage advancement. Policy mengikuti role matrix pada dokumen `05`; setiap perubahan domain admin disimpan pada `admin_audit_logs` beserta actor, before/after state, reason, dan request ID.

Admin dashboard memakai shell operasional dengan sidebar minimize pada desktop, drawer pada mobile, role-aware navigation, dan session guard. UI aktif mencakup list/detail/review Team, Competition, serta Batch. Payment queue, Stage list, audit log, judging, dan agregat summary Admin ditampilkan sebagai placeholder sampai endpoint read-only masing-masing tersedia.

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

Email transaksional runtime menggunakan Brevo Transactional Email API melalui HTTPS/443 agar pengiriman OTP tidak bergantung pada port SMTP yang dapat diblokir oleh jaringan Docker. Konfigurasi produksi menggunakan `TRANSACTIONAL_MAIL_TRANSPORT=brevo`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, dan `BREVO_SENDER_NAME`; `BREVO_SANDBOX=true` tersedia untuk validasi request tanpa mengirim email. Environment testing tetap memakai mailer Laravel agar `Mail::fake()` dan pengujian rollback deterministik.

Jika proteksi IP Brevo aktif, public egress IP dari server/container wajib ditambahkan pada **Settings > Security > Authorized IPs**. Kegagalan provider atau jaringan dikembalikan sebagai API error `EMAIL_DELIVERY_FAILED` (HTTP 503), dan perubahan challenge OTP di-rollback agar kode lama tidak terhapus saat email gagal dikirim.

## Verification result

Quality gate yang wajib tetap hijau:

- MySQL dan SQLite fresh migration + deterministic seed.
- Backend Pest suite.
- Pint formatter.
- TypeScript typecheck.
- Vite production build.
- Docker Compose config validation.
