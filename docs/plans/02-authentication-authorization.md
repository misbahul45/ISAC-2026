# Authentication, Authorization, Guards, and Rate Limiting Plan

## Tujuan

Authentication halaman Inertia menggunakan server-side session dan redirect. Login dan register tidak mengembalikan JSON. Team dan Admin tetap memakai model serta area aplikasi berbeda, tetapi dapat masuk melalui satu halaman login.

## Guard dan provider

Konfigurasi auth menyediakan:

- Provider teams menggunakan model Team.
- Provider admins menggunakan model Admin.
- Guard team menggunakan driver session dan provider teams.
- Guard admin menggunakan driver session dan provider admins.

Model Team dan Admin harus mengimplementasikan Authenticatable. HasApiTokens boleh dipertahankan hanya untuk API/integrasi yang memang membutuhkan token; token tidak menjadi mekanisme utama halaman web.

## Session strategy

- Gunakan cookie HttpOnly, Secure pada production, SameSite Lax, dan session regeneration setelah login.
- Invalidate session dan regenerate CSRF token saat logout.
- Gunakan database atau Redis session driver agar session dapat dicabut secara terpusat.
- Jangan menyimpan bearer token di localStorage.
- Jangan mengirim password, OTP, reset token, atau credential pada Inertia props.
- Session Team dan Admin tidak boleh aktif bersamaan dalam browser yang sama. Login baru melakukan logout guard lain.

## Satu halaman login

Route:

- GET /auth/login.
- POST /auth/login.

POST mencari email ternormalisasi pada admins dan teams.

Aturan:

1. Jika ditemukan Admin aktif, verifikasi password dan login guard admin.
2. Jika tidak ada Admin dan ditemukan Team, verifikasi password dan login guard team.
3. Jika email berada pada kedua tabel, tolak sebagai akun ambigu dan catat alert operasional.
4. Service pembuatan akun Admin/Team harus menolak email yang sudah dipakai lintas tabel.
5. Admin dengan is_active false tidak dapat login.
6. Pesan credential salah tetap generik.

Redirect:

- Admin menuju /admin/dashboard.
- Team menuju hasil TeamNextRouteResolver.
- Team yang belum verifikasi email menuju /auth/verify-email.

Login sukses memperbarui Admin.last_login_at. Untuk Team, last_login_at dapat ditambahkan jika audit login dibutuhkan.

## Register Team

Route:

- GET /auth/register.
- POST /auth/register.

Input minimal:

- email.
- password.
- password_confirmation.

Nama Team tidak wajib pada register dan diisi pada fase Team.

Proses:

1. Normalize email.
2. Validasi unique pada teams dan admins.
3. Buat Team dengan status INCOMPLETE.
4. Generate code yang unique dan race-safe.
5. Login Team dengan guard team.
6. Buat challenge VERIFY_EMAIL.
7. Dispatch email OTP setelah transaction commit.
8. Redirect /auth/verify-email.

Jika pengiriman email gagal, akun tetap ada dan user dapat menggunakan resend. Kegagalan queue harus tercatat dan dimonitor.

## Verify email

Route:

- GET /auth/verify-email.
- POST /auth/verify-email.
- POST /auth/verify-email/resend.

Email Team diambil dari authenticated session, bukan query URL atau hidden input.

Verifikasi:

1. Cari challenge aktif untuk Team dan purpose VERIFY_EMAIL.
2. Tolak jika expired, used, atau attempt limit tercapai.
3. Bandingkan hash OTP secara timing-safe.
4. Tambah attempt_count ketika salah.
5. Ketika benar, isi challenge.used_at dan Team.email_verified_at dalam transaction.
6. Redirect menggunakan TeamNextRouteResolver.

Resend:

1. Terapkan limiter backend.
2. Invalidate challenge aktif.
3. Buat challenge baru.
4. Kirim lewat queue setelah commit.
5. Redirect back dengan flash message generik.

Cooldown frontend hanya UX. Backend limiter tetap menjadi pengaman utama.

## Logout

Route:

- POST /auth/logout.

Proses:

- Deteksi guard aktif.
- Logout guard.
- Invalidate session.
- Regenerate CSRF token.
- Redirect /auth/login.

GET logout tidak disediakan.

## Forgot password

Route:

- GET /auth/forgot-password.
- POST /auth/forgot-password.
- GET /auth/reset-password/verify.
- POST /auth/reset-password/verify.
- POST /auth/reset-password/resend.
- GET /auth/reset-password.
- POST /auth/reset-password.

Flow:

1. User mengirim email.
2. Backend selalu memberi pesan generik: jika akun terdaftar, kode telah dikirim.
3. Jika akun ada, buat challenge RESET_PASSWORD dan kirim OTP.
4. Simpan challenge reference aman dalam session.
5. Redirect ke halaman verify reset.
6. OTP valid menghasilkan reset authorization dalam session; reset token disimpan dalam bentuk hash.
7. Redirect ke halaman password baru.
8. Password berhasil diubah, challenge ditandai used.
9. Seluruh session dan token akun dicabut.
10. Redirect /auth/login dengan flash success.

Email, OTP, dan reset token tidak diletakkan pada query URL.

Flow reset mendukung Team dan Admin melalui account_type pada auth challenge.

## Authentication middleware

Middleware yang direncanakan:

- guest.all: hanya guest; authenticated principal diarahkan ke area yang benar.
- auth.team: hanya Team guard.
- auth.admin: hanya Admin guard.
- verified.team: Team harus memiliki email_verified_at.
- active.admin: Admin harus is_active.
- canonical.team.route: memaksa route sesuai state Team.
- throttle named limiter per auth action.

Area route:

- /auth/*: guest atau pending email verification sesuai action.
- /registration/*: auth.team, verified.team, canonical.team.route.
- /dashboard/*: auth.team, verified.team, canonical.team.route.
- /admin/*: auth.admin, active.admin.

## Authorization

Authentication hanya memastikan siapa user. Authorization memastikan apa yang boleh dilakukan.

### Team

Team hanya boleh:

- Membaca dan mengubah profil sendiri.
- Mengelola Member milik Team sendiri.
- Mengubah Registration sendiri sebelum terkunci.
- Mengunggah bukti pembayaran untuk Registration sendiri ketika status mengizinkan.
- Membaca Submission, Exam, dan Stage miliknya.

Team tidak boleh mengirim team_id dari client sebagai sumber ownership. Backend selalu mengambil Team dari guard.

### Admin

Gunakan Policy atau Gate:

- CompetitionPolicy: viewAny, view, create, update, delete.
- BatchPolicy: viewAny, view, create, update, delete.
- TeamPolicy: viewAny, view, verifyData, requestRevision, reject.
- RegistrationPolicy: viewAny, view, verifyPayment, requestPaymentRevision, rejectPayment.
- StagePolicy: advanceTeam.

Role Admin awal dapat menggunakan:

- super_admin.
- admin_registration.
- admin_payment.
- judge, jika nanti dipakai untuk Submission.

Authorization tidak ditulis sebagai if role tersebar di controller. Controller memanggil authorize dan action/service menjalankan bisnis.

### Object ownership

- Route model binding harus scoped.
- File payment harus direferensikan melalui Registration milik Team.
- Member ID harus diverifikasi team_id-nya.
- Batch update harus memastikan competition_id yang benar.
- Admin action harus mencatat actor.

## Rate limiting

Gunakan named limiter dengan key gabungan normalized email, IP, account ID jika tersedia, dan purpose. Key harus di-hash agar email tidak muncul mentah di cache key atau log.

| Action | Burst limit | Sustained limit | Respons |
|---|---:|---:|---|
| Login | 5 per menit | 20 per jam per email/IP | Redirect back, generic error |
| Register | 3 per menit per IP | 10 per jam per IP | Redirect back |
| Verify email OTP | 5 per 10 menit | Challenge max attempts | Redirect back |
| Resend email OTP | 1 per menit | 5 per jam per Team | Redirect back |
| Forgot password | 3 per 15 menit | 5 per jam per email/IP | Selalu generic |
| Verify reset OTP | 5 per 15 menit | Challenge max attempts | Redirect back |
| Resend reset OTP | 1 per menit | 5 per jam per account | Redirect back |
| Change password | 3 per 15 menit | Satu kali per challenge | Redirect login |
| Logout | 10 per menit | Tidak perlu sustained | Redirect login |

Nilai dapat dipindah ke config agar bisa diubah tanpa menyentuh controller.

### Progressive login defense

- Lima kegagalan awal memicu cooldown singkat.
- Kegagalan berulang memperpanjang cooldown per email/IP.
- Login sukses membersihkan counter yang relevan.
- Jangan mengunci akun permanen hanya karena serangan dari satu IP.
- Catat event login_failed tanpa menyimpan password.
- Pertimbangkan CAPTCHA hanya setelah pola abuse terdeteksi, bukan pada semua login.

### OTP defense

- OTP enam digit, expiry lima menit.
- Simpan hash OTP.
- Maksimum lima percobaan per challenge.
- Resend menginvalidasi OTP sebelumnya.
- Challenge single use.
- Response tidak membocorkan apakah OTP hampir benar.

## CSRF, session fixation, dan open redirect

- Semua POST/PATCH/PUT/DELETE web memakai CSRF.
- Regenerate session ID setelah login dan password reset.
- Parameter intended URL hanya menerima internal route yang sudah diizinkan.
- Jangan redirect ke URL dari request tanpa whitelist.
- Setelah login Team, canonical resolver lebih tinggi prioritasnya daripada intended URL yang tidak boleh diakses.

## Password security

- Gunakan Laravel Hash dengan algorithm konfigurasi production.
- Password minimum delapan karakter untuk kompatibilitas awal; target rekomendasi dua belas karakter.
- Terapkan password confirmation.
- Password tidak pernah ditulis ke log.
- Reset password mencabut session dan token lama.
- Admin dapat diwajibkan password policy lebih kuat dan MFA pada fase berikutnya.

## Audit dan observability

Catat event:

- auth.login_succeeded.
- auth.login_failed.
- auth.logout.
- auth.otp_sent.
- auth.otp_verified.
- auth.otp_failed.
- auth.password_reset_requested.
- auth.password_changed.
- auth.rate_limited.
- authorization.denied.

Log berisi actor ID jika ada, account type, IP teranonymisasi sesuai kebijakan, user agent ringkas, dan request ID. Jangan log OTP, token, password, atau full session ID.

## Response contract web

Semua auth mutation menghasilkan RedirectResponse:

- Sukses: redirect target dan flash success.
- Validation error: redirect back dengan error bag dan safe old input.
- Credential error: redirect back dengan pesan generik.
- Rate limited: redirect back dengan pesan serta retry hint.

Login dan register tidak memiliki response JSON untuk UI Inertia.

## Test wajib

- Team register membuat session dan redirect verify email.
- OTP benar, salah, expired, reused, dan max attempts.
- Resend menginvalidasi OTP lama.
- Login Team ke canonical route.
- Login Admin ke admin dashboard.
- Admin inactive ditolak.
- Email lintas tabel ambigu ditolak.
- Session ID berubah setelah login.
- Logout menginvalidasi session.
- Forgot password tidak membocorkan keberadaan email.
- Reset token single use.
- Password reset mencabut session/token lama.
- Seluruh limiter menghasilkan 429 yang diterjemahkan menjadi redirect UI.
- Team tidak dapat mengakses Admin.
- Admin tanpa ability tidak dapat melakukan action.
- Team tidak dapat mengubah resource Team lain.

