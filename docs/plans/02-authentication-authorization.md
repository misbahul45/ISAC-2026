# Authentication, Authorization, Guards, and Rate Limiting Plan

## Tujuan

Authentication menggunakan Sanctum token via JSON API. Login dan register mengembalikan token + data user dalam format JSON. Team dan Admin memiliki guard terpisah tetapi menggunakan **satu endpoint login** yang sama.

## Guard dan provider

Konfigurasi auth menyediakan:

- Provider teams menggunakan model Team.
- Provider admins menggunakan model Admin.
- Guard teams menggunakan driver sanctum dan provider teams.
- Guard admins menggunakan driver sanctum dan provider admins.

Model Team dan Admin harus mengimplementasikan Authenticatable (Team sudah, Admin perlu ditambah) dan HasApiTokens.

## Token strategy

- Login menghasilkan Sanctum token yang dikembalikan sebagai Bearer token.
- Frontend menyimpan token di localStorage dan mengirimkan sebagai header `Authorization: Bearer {token}`.
- Token dihapus saat logout (`currentAccessToken()->delete()`).
- Tidak ada session fixation atau CSRF untuk API token.
- Token expiry dapat dikonfigurasi di `config/sanctum.php`.

## Endpoint Auth

Semua endpoint berada di prefix `/api/auth` di `routes/api.php`.

### Register Team

`POST /api/auth/register`

Input:
- email.
- password.
- password_confirmation.

Proses:
1. Normalize email.
2. Validasi unique pada teams dan admins.
3. Buat Team dengan status INCOMPLETE.
4. Generate code yang unique dan race-safe (gunakan lock atau UUID-based).
5. Buat challenge VERIFY_EMAIL.
6. Dispatch email OTP setelah transaction commit.
7. Return JSON dengan data Team.

Response sukses (201):
```json
{
  "status": "success",
  "message": "Akun team berhasil dibuat. Silakan cek email kamu untuk kode verifikasi.",
  "data": {
    "id": "uuid",
    "email": "team@example.com",
    "code": "ISAC-TM-001",
    "name": null,
    "status": "INCOMPLETE",
    "emailVerifiedAt": null,
    "nextRedirect": "/auth/verify-email",
    "redirectTo": "/auth/verify-email",
    "createdAt": "2026-07-21T10:00:00.000Z"
  }
}
```

### Login (Satu Endpoint untuk Team dan Admin)

`POST /api/auth/login`

Input:
- email.
- password.

Proses:
1. Cari email ternormalisasi pada tabel `admins` dan `teams`.
2. Jika ditemukan di **kedua** tabel → tolak sebagai akun ambigu, catat alert operasional.
3. Jika ditemukan **Admin** aktif (`is_active = true`):
   - Verifikasi password.
   - Buat Sanctum token.
   - Update `last_login_at`.
   - Return `{ token, tokenType, principalType: 'ADMIN', admin: {...}, redirectTo: '/admin/dashboard' }`.
4. Jika ditemukan **Team**:
   - Verifikasi password.
   - Cek `email_verified_at`.
   - Buat Sanctum token.
   - Return `{ token, tokenType, principalType: 'TEAM', team: {...}, redirectTo: '<canonical>' }`.
5. Jika tidak ditemukan di kedua tabel → 401 generic.
6. Admin dengan `is_active = false` ditolak.
7. Pesan credential salah tetap generik.

Response sukses Team (200):
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "token": "1|abc123...",
    "tokenType": "Bearer",
    "principalType": "TEAM",
    "team": { "id": "uuid", "email": "...", "status": "INCOMPLETE", ... },
    "redirectTo": "/registration"
  }
}
```

Response sukses Admin (200):
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "token": "1|abc123...",
    "tokenType": "Bearer",
    "principalType": "ADMIN",
    "admin": { "id": "uuid", "email": "...", "name": "...", "role": "super_admin" },
    "redirectTo": "/admin/dashboard"
  }
}
```

Error:
- Email/password salah → 401 generic.
- Email belum diverifikasi (Team) → 401 dengan pesan spesifik.
- Akun ambigu (email di Team dan Admin) → 409.
- Admin nonaktif → 403.

### Me

`GET /api/auth/me`

Mengembalikan data user yang sedang login (Team atau Admin).
- Middleware: auth:sanctum.
- Backend deteksi guard berdasarkan token guard name.
- Return `principalType` + data sesuai guard.

### Verify Email

`POST /api/auth/verify-email`

Input:
- code.

Proses:
1. Ambil Team dari authenticated token.
2. Cari challenge VERIFY_EMAIL aktif untuk Team.
3. Validasi OTP (expired, used, attempt limit).
4. Bandingkan OTP.
5. Tandai email_verified_at.

### Resend Verification

`POST /api/auth/verify-email/resend`

Input: none (email diambil dari authenticated token).

Proses:
1. Ambil Team dari authenticated token.
2. Invalidate challenge sebelumnya.
3. Buat challenge baru.
4. Kirim email OTP.

### Forgot Password

`POST /api/auth/forgot-password`

Input:
- email.

Response:
```json
{
  "status": "success",
  "message": "Kode reset password berhasil dikirim ke email",
  "data": { "email": "team@example.com" }
}
```

Catatan: Plan sebelumnya meminta response generik. Saat ini masih mengembalikan email. Perlu diperbaiki menjadi generik.

### Verify Reset Code

`POST /api/auth/reset-password/verify`

Input:
- code.

Response:
```json
{
  "status": "success",
  "message": "Kode berhasil diverifikasi",
  "data": { "resetToken": "random64string..." }
}
```

### Change Password

`POST /api/auth/reset-password`

Input:
- password.
- password_confirmation.

Proses:
1. Ambil resetToken dari session/challenge yang sudah diverifikasi sebelumnya.
2. Validasi token.
3. Update password.
4. Hapus semua token Team (revoke all sessions).

### Logout

`POST /api/auth/logout`

- Middleware: auth:sanctum.
- Hapus currentAccessToken.

## Middleware

Middleware yang digunakan:

- auth:sanctum: protected route untuk Team terautentikasi.
- throttle:N,M: rate limiting per endpoint.

## Authorization

Authentication hanya memastikan siapa user. Authorization memastikan apa yang boleh dilakukan.

### Team

Team hanya boleh:

- Membaca dan mengubah profil sendiri (diambil dari guard, bukan dari input client).
- Mengelola Member milik Team sendiri.
- Mengubah Registration sendiri sebelum terkunci.
- Mengunggah bukti pembayaran untuk Registration sendiri ketika status mengizinkan.
- Membaca Submission, Exam, dan Stage miliknya.

### Admin

Gunakan Policy:

- CompetitionPolicy: viewAny, view, create, update, delete.
- BatchPolicy: viewAny, view, create, update, delete.
- TeamPolicy: viewAny, view, verifyData, requestRevision, reject.
- RegistrationPolicy: viewAny, view, verifyPayment, requestPaymentRevision, rejectPayment.
- StagePolicy: advanceTeam.

Role Admin awal:

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

Gunakan named limiter dengan key gabungan normalized email, IP, account ID jika tersedia, dan purpose.

| Action | Burst limit | Sustained limit | Respons |
|---|---:|---:|---|
| Login | 5 per menit | 20 per jam per email/IP | 429 JSON |
| Register | 3 per menit per IP | 10 per jam per IP | 429 JSON |
| Verify email OTP | 5 per 10 menit | Challenge max attempts | 429 JSON |
| Resend email OTP | 1 per menit | 5 per jam per Team | 429 JSON |
| Forgot password | 3 per 15 menit | 5 per jam per email/IP | Selalu generic |
| Verify reset OTP | 5 per 15 menit | Challenge max attempts | 429 JSON |
| Resend reset OTP | 1 per menit | 5 per jam per account | 429 JSON |
| Change password | 3 per 15 menit | Satu kali per challenge | 429 JSON |
| Logout | 10 per menit | Tidak perlu sustained | 429 JSON |

Nilai dapat dipindah ke config agar bisa diubah tanpa menyentuh controller.

### Progressive login defense

- Lima kegagalan awal memicu cooldown singkat.
- Kegagalan berulang memperpanjang cooldown per email/IP.
- Login sukses membersihkan counter yang relevan.
- Jangan mengunci akun permanen hanya karena serangan dari satu IP.
- Catat event login_failed tanpa menyimpan password.

### OTP defense

- OTP enam digit, expiry lima menit.
- Simpan hash OTP.
- Maksimum lima percobaan per challenge.
- Resend menginvalidasi OTP sebelumnya.
- Challenge single use.
- Response tidak membocorkan apakah OTP hampir benar.

## Password security

- Gunakan Laravel Hash dengan algorithm konfigurasi production.
- Password minimum delapan karakter.
- Terapkan password confirmation.
- Password tidak pernah ditulis ke log.
- Reset password mencabut semua token lama.
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

## Response format

Semua endpoint mengembalikan JSON dengan format:

Sukses:
```json
{
  "status": "success",
  "message": "Pesan sukses.",
  "data": {},
  "metadata": {},
  "error": null
}
```

Error:
```json
{
  "status": "error",
  "message": "Pesan error.",
  "data": null,
  "metadata": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "details": { "field": ["Error message"] }
  }
}
```

## Yang perlu diperbaiki dari implementasi saat ini

1. Admin model: tambahkan trait Authenticatable.
2. Admin login: buat endpoint terpisah.
3. Forgot password: response tidak boleh membocorkan email.
4. auth_challenges: ganti tabel password_reset_codes dengan struktur hash.
5. Code generator: gunakan lock agar race-safe.
6. Failed login attempt: catat audit.
7. Policies: implementasikan untuk authorization.

## Test wajib

- Team register mengembalikan JSON dengan data Team.
- OTP benar, salah, expired, reused, dan max attempts.
- Resend menginvalidasi OTP lama.
- Shared login: login Team mengembalikan `principalType: 'TEAM'` + token.
- Shared login: login Admin mengembalikan `principalType: 'ADMIN'` + token.
- Shared login: Admin inactive ditolak (403).
- Shared login: email ada di kedua tabel ditolak (409).
- Shared login: credential salah tetap generic (401).
- Logout menghapus token.
- Forgot password tidak membocorkan keberadaan email (response generik).
- Reset token single use.
- Password reset mencabut semua token lama.
- Seluruh limiter menghasilkan 429 JSON.
- Team tidak dapat mengakses resource Admin.
- Admin tanpa ability tidak dapat melakukan action.
- Team tidak dapat mengubah resource Team lain.
