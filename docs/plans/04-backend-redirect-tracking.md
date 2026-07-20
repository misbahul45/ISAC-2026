# Backend Redirect and Registration Tracking Plan

## Tujuan

Backend menentukan halaman canonical untuk setiap Team. Client hanya mengikuti redirect. Rule yang sama dipakai ketika:

- Login berhasil.
- Email berhasil diverifikasi.
- User membuka root saat masih login.
- User membuka dashboard.
- User mengetik URL registration secara langsung.
- Submit fase registration berhasil.
- Admin mengubah status atau Stage.

## Komponen domain

### TeamNextRouteResolver

Service read-only yang menerima Team beserta Registration, Competition, Batch, dan Stage lalu mengembalikan named route beserta parameter yang aman.

Resolver:

- Tidak melakukan update DB.
- Tidak membaca request URL sebagai sumber state.
- Menggunakan enum/value object, bukan string tersebar.
- Memiliki unit test untuk seluruh kombinasi state.

### EnsureCanonicalTeamRoute middleware

Middleware membandingkan route aktif dengan route dari resolver.

- Jika route aktif valid untuk state tersebut, request dilanjutkan.
- Jika tidak valid, HTTP redirect ke route canonical.
- Mutation endpoint memvalidasi expected phase secara terpisah agar tidak terjadi redirect loop.
- Route logout, verify email, dan endpoint upload yang dibutuhkan pada fase aktif memiliki allowlist eksplisit.

### ActivateTeamStage service

Service idempotent yang mengaktifkan Stage ketika seluruh gate verified. Service ini bukan bagian dari resolver karena resolver tidak boleh mengubah state.

## Urutan resolusi

### 1. Email verification

Jika email_verified_at null:

- Canonical route /auth/verify-email.
- Team tidak boleh membuka registration atau dashboard.

### 2. Registration selection

Jika Registration belum ada:

- Canonical route /registration.

### 3. Team phase

Jika team_completed_at null:

- Canonical route /registration/team.

### 4. Member phase

Jika members_completed_at null:

- Canonical route /registration/biodata.

### 5. Document phase

Jika documents_completed_at null:

- Canonical route /registration/documents.

### 6. Data revision

Jika Team.status REVISION_REQUIRED:

- revision_step TEAM menuju /registration/team.
- revision_step MEMBERS menuju /registration/biodata.
- revision_step DOCUMENTS menuju /registration/documents.
- revision_step null dianggap data inconsistency dan diarahkan ke safe waiting/error page serta dilaporkan.

Data revision ditempatkan sebelum payment waiting agar perbaikan identitas tidak tertutup oleh halaman pembayaran.

### 7. Data rejection

Jika Team.status REJECTED:

- Canonical route /registration/rejected.

### 8. Payment gate

Jika Registration.status:

- WAITING_PAYMENT menuju /registration/payment.
- REVISION_REQUIRED menuju /registration/payment.
- REJECTED menuju /registration/payment-rejected.
- WAITING_VERIFICATION menuju waiting verification.

Payment route hanya muncul setelah Team, Member, dan Documents selesai.

### 9. Submission

Jika submitted_at null tetapi semua completion marker sudah terisi:

- OLIMPIADE dengan payment belum dikirim menuju payment.
- Non-Olympiad menjalankan finalization pada mutation Documents; kondisi ini dianggap recoverable inconsistency dan dapat diselesaikan oleh repair action/service.

Resolver sendiri tidak melakukan finalization.

### 10. Team verification

Jika Team.status WAITING_VERIFICATION:

- Canonical route /registration/waiting-verification.

Jika Team.status INCOMPLETE setelah submitted_at:

- Anggap inconsistent, arahkan ke safe registration summary dan catat error.

### 11. Dashboard

Jika:

- submitted_at terisi.
- Team.status VERIFIED.
- Registration.status VERIFIED.
- current_stage_id terisi.

maka canonical route /dashboard.

Jika kedua status VERIFIED tetapi current_stage_id null, route sementara waiting-activation dan alert operasional dibuat. Activation service seharusnya memperbaiki kondisi ini.

## Matriks ringkas

| Kondisi utama | Canonical route |
|---|---|
| Email belum verified | /auth/verify-email |
| Belum ada Registration | /registration |
| Team phase belum selesai | /registration/team |
| Member belum final | /registration/biodata |
| Documents belum selesai | /registration/documents |
| Data revision | Route berdasarkan revision_step |
| Data rejected | /registration/rejected |
| Payment belum dikirim | /registration/payment |
| Payment revision | /registration/payment |
| Payment rejected | /registration/payment-rejected |
| Menunggu data/payment Admin | /registration/waiting-verification |
| Verified tetapi Stage belum aktif | /registration/waiting-activation |
| Semua gate terpenuhi | /dashboard |

## Root dan auth redirect

GET /:

- Guest melihat landing page.
- Admin authenticated menuju /admin/dashboard.
- Team authenticated menuju TeamNextRouteResolver.

GET /auth/login dan /auth/register:

- Guest dapat membuka.
- Admin authenticated menuju /admin/dashboard.
- Team authenticated menuju TeamNextRouteResolver.

POST /auth/login:

- Admin login menuju admin dashboard.
- Team login selalu memakai resolver.

POST /auth/verify-email:

- Setelah berhasil selalu memakai resolver.

## Redirect setelah mutation

| Mutation | Redirect sukses |
|---|---|
| Register | Verify email |
| Verify email | Competition selection |
| Select Competition/Batch | Team phase |
| Update Team | Biodata |
| Finalize Member | Documents |
| Documents Olympiad | Payment |
| Documents non-Olympiad | Waiting verification |
| Submit payment | Waiting verification |
| Resubmit revision | Waiting verification atau next incomplete phase |
| Logout | Login |
| Reset password | Login |

Controller tidak menulis path secara bebas. Controller meminta resolver atau menggunakan named route yang menjadi hasil action domain.

## Route access rules

Team masih boleh membuka fase sebelumnya sebelum submitted_at untuk memperbaiki data, tetapi setelah submitted:

- Hanya route canonical.
- Fase revisi yang dibuka Admin.
- Read-only summary.
- Logout.

Jika akses fase sebelumnya diizinkan sebelum submit, mutation pada fase tersebut harus menghitung apakah completion marker downstream perlu dibatalkan.

## Flash dan error

- Redirect sukses membawa flash success singkat.
- Redirect canonical normal tidak menampilkan error.
- Akses yang dilarang policy menghasilkan 403.
- State inconsistency menghasilkan safe redirect, request ID, dan server log; detail internal tidak ditampilkan.
- Rate limit redirect membawa retry_after yang aman untuk countdown.

## Caching

Resolver awal tidak perlu cache karena data state kecil dan sensitif terhadap perubahan. Gunakan eager loading untuk Registration, Competition, Batch, dan currentStage agar tidak terjadi N+1.

Jika nanti cache diperlukan:

- Cache per Team ID.
- Invalidate pada semua mutation Team, Registration, Member, dan Stage.
- TTL pendek.

## Loop prevention

- Resolver menghasilkan named route canonical.
- Middleware tidak diterapkan pada route yang menjadi target pending verification secara salah.
- Setiap route memiliki metadata area dan allowed states.
- Maksimum satu redirect per request.
- Test memastikan seluruh state memiliki satu target deterministik.

## Test matrix

- Guest, Team, dan Admin pada root/login/register.
- Setiap completion marker null secara bergantian.
- Setiap Team.status.
- Setiap Registration.status.
- Ketiga revision_step.
- Olympiad upfront payment.
- Non-Olympiad initial auto verification.
- Non-Olympiad Semifinal payment.
- Direct URL menuju future step.
- Direct URL menuju previous step setelah submitted.
- State inconsistent tanpa redirect loop.
- Login dan verify email menghasilkan target sama dengan middleware.

