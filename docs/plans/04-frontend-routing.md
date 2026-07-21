# Frontend Routing and Navigation Plan

## Tujuan

Frontend menentukan halaman yang ditampilkan berdasarkan:
1. Response API (`redirectTo` field).
2. State lokal (token ada/tidak).
3. Data context dari backend (`GET /api/registrations/me/context`).

Backend tidak melakukan redirect HTTP. Backend hanya memberikan data dan rekomendasi navigasi (`redirectTo`).

## Sumber navigasi

### 1. Setelah mutation success

Setiap mutation auth dan registration mengembalikan `data.redirectTo`:
```json
{
  "status": "success",
  "data": {
    "redirectTo": "/registration/team"
  }
}
```

Frontend menggunakan `router.visit(redirectTo)` (Inertia) atau navigasi programmatic.

### 2. Setelah login / app mount

Frontend cek apakah token ada di localStorage:
- Tidak ada → arahkan ke `/auth/login`.
- Ada → GET `/api/auth/me` untuk validasi token.
  - Sukses → lanjut ke halaman yang diminta atau `/dashboard`.
  - 401 → hapus token, redirect `/auth/login`.

### 3. Route protection

Frontend memiliki route guard component:

```tsx
function RequireAuth({ children }) {
  const token = localStorage.getItem('auth_token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/auth/login" />
  }

  // Optional: validate token via /api/auth/me
  return children
}
```

## Resolver state navigasi (client-side)

Frontend memiliki helper untuk menentukan halaman registration yang tepat berdasarkan data dari `GET /api/registrations/me/context`:

```
if (!registration) → /registration
if (!team_completed_at) → /registration/team
if (!members_completed_at) → /registration/biodata
if (!documents_completed_at) → /registration/documents
if (registration.status === WAITING_PAYMENT) → /registration/payment
if (registration.status === WAITING_VERIFICATION) → /registration/waiting-verification
if (team.status === REVISION_REQUIRED) → /registration/{revision_step}
if (team.status === REJECTED) → /registration/rejected
if (submitted && verified) → /dashboard
```

## Alur navigasi

### Root

`GET /`:
- Guest → landing page.
- Authenticated → `/dashboard` atau halaman registration sesuai state.

### Setelah login

```ts
const response = await loginMutation.mutateAsync(data)
localStorage.setItem('auth_token', response.data.token)
router.visit(response.data.redirectTo ?? response.data.team.nextRedirect ?? '/dashboard')
```

### Setelah register

```ts
const response = await registerMutation.mutateAsync(data)
router.visit(response.data.redirectTo ?? '/auth/verify-email')
```

### Setelah mutation registration

```ts
const response = await updateTeamMutation.mutateAsync(data)
router.visit(response.data.redirectTo) // '/registration/biodata' dari backend
```

### Setelah logout

```ts
await logoutMutation.mutateAsync()
localStorage.removeItem('auth_token')
router.visit('/auth/login')
```

### Setelah 401

API interceptor mendeteksi response 401:
```ts
if (response.status === 401) {
  localStorage.removeItem('auth_token')
  window.location.href = '/auth/login'
}
```

## Route structure (frontend)

Halaman yang ada di frontend:

### Public
- `/auth/login` — Login form.
- `/auth/register` — Register form.
- `/auth/forgot-password` — Forgot password.
- `/auth/verify-email` — Verify email OTP.
- `/auth/reset-password/verify` — Verify reset OTP.
- `/auth/reset-password` — Change password.

### Protected (RequireAuth)
- `/registration` — Pilih Competition & Batch.
- `/registration/team` — Form data Team.
- `/registration/biodata` — Form Member.
- `/registration/documents` — Form dokumen.
- `/registration/payment` — Upload bukti bayar.
- `/registration/waiting-verification` — Waiting page.
- `/registration/rejected` — Rejected page.
- `/dashboard` — Dashboard Team.

Setiap page registration melakukan GET context untuk validasi apakah halaman tersebut memang seharusnya diakses.

## State inconsistency

Jika frontend mendeteksi inconsistency (misal: user akses `/registration/payment` tapi context menunjukkan documents belum selesai):
1. Redirect paksa ke halaman yang benar berdasarkan context.
2. Tampilkan toast/alert jika diperlukan.

## Matriks navigasi

| Kondisi | Halaman |
|---|---|
| Token tidak ada | /auth/login |
| Token ada, email belum verified | /auth/verify-email |
| Token ada, verified, belum ada Registration | /registration |
| Team phase belum selesai | /registration/team |
| Member belum final | /registration/biodata |
| Documents belum selesai | /registration/documents |
| Payment belum dikirim | /registration/payment |
| Payment revision | /registration/payment |
| Data revision | /registration sesuai revision_step |
| Data rejected | /registration/rejected |
| Payment rejected | /registration/payment-rejected |
| Menunggu verifikasi | /registration/waiting-verification |
| Semua gate terpenuhi | /dashboard |

## API interceptor

Frontend memiliki interceptor di `resources/js/lib/api.ts` yang:
1. Menambahkan `Authorization: Bearer {token}` dari localStorage.
2. Menangani 401 → hapus token + redirect login.
3. Menangani 429 → tampilkan retry countdown.
4. Menangani 422 → parse validation errors.

## Yang perlu diimplementasikan

1. **RequireAuth component** — wrapper untuk route protection.
2. **API interceptor** — di `api.ts`, tambah Bearer token dari localStorage.
3. **Login flow** — simpan token ke localStorage setelah login success.
4. **Logout flow** — hapus token dari localStorage.
5. **Context resolver** — helper client-side untuk menentukan halaman registration.
6. **Error handling 401** — auto logout + redirect.
