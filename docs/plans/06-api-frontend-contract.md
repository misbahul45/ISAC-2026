# API and Frontend Contract Plan


> Status implementasi dan keputusan canonical terbaru dicatat pada `08-implementation-status.md`.
## Pendekatan

Aplikasi menggunakan React (Inertia) sebagai frontend yang berkomunikasi dengan backend Laravel melalui JSON API. Seluruh data dan mutation menggunakan format JSON. Frontend mengelola navigasi sendiri berdasarkan response API.

1. Seluruh komunikasi menggunakan JSON API.
2. Auth mutation mengembalikan token + data.
3. Registration mutation mengembalikan data + `redirectTo`.
4. File upload tetap JSON API.

## Konvensi naming

- Database dan request backend menggunakan snake_case.
- Response API boleh menggunakan camelCase jika transformer konsisten.
- TypeScript type dibuat dari kontrak yang sama.
- Competition code wajib canonical.
- ID seluruh domain menggunakan UUID string.
- Date response menggunakan ISO 8601 dengan timezone.

## Format response standar

Semua endpoint mengembalikan format:

```typescript
type ApiResponse<T> = {
  status: 'success' | 'error'
  message: string
  data: T | null
  metadata: Record<string, unknown>
  error: {
    code?: string
    details?: Record<string, string[]>
  } | null
}
```

## Auth API

### Register

`POST /api/auth/register`

Input:
```typescript
type RegisterPayload = {
  email: string
  password: string
  password_confirmation: string
}
```

Response:
```typescript
type RegisterData = {
  id: string
  email: string
  code: string
  name: string | null
  status: TeamStatus
  emailVerifiedAt: string | null
  nextRedirect: string
  redirectTo: string
  createdAt: string
}
```

### Login (Shared — Team & Admin)

`POST /api/auth/login`

Input:
```typescript
type LoginPayload = {
  email: string
  password: string
}
```

Response Team:
```typescript
type LoginData = {
  token: string
  tokenType: 'Bearer'
  principalType: 'TEAM'
  team: AuthTeam
  redirectTo: string
  emailVerificationRequired: boolean
}

type AuthTeam = {
  id: string
  code: string
  email: string
  name: string | null
  phone: string | null
  institutionName: string | null
  status: TeamStatus
  emailVerifiedAt: string | null
  nextRedirect: string
  redirectTo: string
}
```

`GET /api/auth/me` memakai kontrak `AuthTeam` yang sama. Frontend wajib memakai
`nextRedirect` sebagai source of truth untuk guard `/dashboard`: Team yang belum
menyelesaikan registrasi diarahkan ke step registrasi aktual, sedangkan Admin
diarahkan ke `/admin/dashboard`.

Response Admin:
```typescript
type AdminLoginData = {
  token: string
  tokenType: 'Bearer'
  principalType: 'ADMIN'
  admin: {
    id: string
    email: string
    name: string
    role: string
  }
  redirectTo: '/admin/dashboard'
  emailVerificationRequired: false
}
```

Untuk Team yang belum terverifikasi, login mengirim OTP baru dan mengembalikan `emailVerificationRequired: true` serta `redirectTo: '/auth/verify-email'`. Frontend menyimpan token terlebih dahulu, menampilkan status pengiriman, kemudian membuka UI verifikasi.

Frontend menentukan halaman berdasarkan `principalType`:
- `TEAM` → render halaman Team, navigasi pakai `redirectTo`.
- `ADMIN` → render halaman Admin, navigasi ke `/admin/dashboard`.

### Verify Email

`POST /api/auth/verify-email`

Input:
```typescript
type VerifyEmailPayload = {
  code: string
}
```

### Resend Verification

`POST /api/auth/verify-email/resend`

Input: none (email diambil dari authenticated token).

### Forgot Password

`POST /api/auth/forgot-password`

Input:
```typescript
type ForgotPasswordPayload = {
  email: string
}
```

Response:
```typescript
type ForgotPasswordData = {
  email: string
}
```

### Verify Reset Code

`POST /api/auth/reset-password/verify`

Input:
```typescript
type VerifyResetCodePayload = {
  code: string
}
```

Response:
```typescript
type VerifyResetCodeData = {
  resetToken: string
}
```

### Change Password

`POST /api/auth/reset-password`

Input:
```typescript
type ChangePasswordPayload = {
  password: string
  password_confirmation: string
}
```

### Me

`GET /api/auth/me`

Response (Team):
```typescript
type MeData = {
  principalType: 'TEAM'
  team: AuthTeam
}
```

Response (Admin):
```typescript
type MeData = {
  principalType: 'ADMIN'
  admin: {
    id: string
    email: string
    name: string
    role: string
  }
}
```

### Logout

`POST /api/auth/logout`

## Registration API

### Competition List

`GET /api/competitions?status=REGISTRATION_OPEN&type=`

Response:
```typescript
type CompetitionListData = Array<{
  id: string
  name: string
  slug: string
  type: 'OLIMPIADE' | 'BUSINESS_PLAN' | 'BUSINESS_IT_CASE'
  description: string
  paymentFlow: 'UPFRONT' | 'SEMIFINAL'
  startDate: string
  endDate: string
  status: string
  openBatches: Array<{
    id: string
    name: string
    slug: string
    startAt: string
    endAt: string
    price: number
    quota: number | null
    remainingQuota: number
    status: string
  }>
}>
```

### Registration Context

`GET /api/registrations/me/context`

Response:
```typescript
type RegistrationContextData = {
  registration: Registration | null
  team: TeamProfile
  progress: {
    teamCompleted: boolean
    membersCompleted: boolean
    documentsCompleted: boolean
    submitted: boolean
  }
}

type Registration = {
  id: string
  status: RegistrationStatus
  competition: CompetitionSummary
  batch: BatchSummary
}
```

### Select Competition & Batch

`POST /api/registrations/me/selection`

Input:
```typescript
type SelectCompetitionPayload = {
  competition_id: string
  batch_id: string
}
```

Response:
```typescript
type RegistrationMutationData = {
  redirectTo: string
}
```

### Team Profile

`GET /api/registrations/me/team`

Response:
```typescript
type TeamProfileData = {
  name: string | null
  phone: string | null
  institutionName: string | null
  competition_summary: { name: string, type: string }
}
```

### Update Team

`PATCH /api/registrations/me/team`

Input:
```typescript
type TeamFormValues = {
  name: string
  phone: string
  institution_name: string
  institution_address: string
}
```

`institution_address` adalah hasil `JSON.stringify({ province, city, address })`.
UI menampilkan enam input dalam dua kolom pada desktop (tiga identitas di kiri,
tiga alamat di kanan) dan satu kolom pada layar kecil.

### Members

`GET /api/registrations/me/members`

Response:
```typescript
type MembersPageData = {
  competitionType: string
  participantCategory: 'HIGH_SCHOOL_STUDENT' | 'UNIVERSITY_STUDENT'
  identityLabel: 'NISN' | 'NIM'
  showsLeaderRole: boolean
  minMembers: number
  maxMembers: number
  members: Array<MemberData>
  revisionNote: string | null
}

type MemberData = {
  id: string | null
  name: string
  role: 'LEADER' | 'MEMBER'
  email: string
  major: string | null
  faculty: string | null
  student_id: string
  photo_file_id: string | null
  sort_order: number
}
```

### Finalize Members

`PUT /api/registrations/me/members`

Input:
```typescript
type FinalizeMembersPayload = {
  members: Array<MemberFormValues>
}
```

`MemberFormValues` tidak memiliki phone, education_level, atau birth_date. `student_id` berisi NISN untuk SMA/SMK/MA dan NIM untuk mahasiswa. Foto nullable; major dan faculty hanya wajib untuk BUSINESS_IT_CASE.

Business Plan dan Business IT Case selalu mengirim tepat tiga Member. Frontend
langsung menyediakan tiga slot tetap tanpa tombol tambah atau hapus; Olimpiade
menyediakan satu slot peserta.

### Documents

`GET /api/registrations/me/documents`

Response:
```typescript
type DocumentsPageData = {
  document_url: string | null
  twibbon_url: string | null
  revisionNote: string | null
}
```

### Update Documents

`PATCH /api/registrations/me/documents`

Input:
```typescript
type DocumentsFormValues = {
  document_url: string
  twibbon_url: string
}
```

### Payment

`GET /api/registrations/me/payment`

Response:
```typescript
type PaymentPageData = {
  originalAmount: number
  amount: number
  discountPercent: number
  discountAmount: number
  promoApplied: boolean
  promoCode: string | null
  paymentMethods: string[]
  paymentInstructions: string
  paymentStatus: string
  existingProof: FileData | null
  rejectionReason: string | null
}
```

`POST /api/registrations/me/payment/quote` menerima `promo_code` nullable dan mengembalikan `originalAmount`, `discountPercent`, `discountAmount`, `amount`, `promoApplied`, serta `promoCode`.

### Submit Payment

`POST /api/registrations/me/payment`

Input:
```typescript
type PaymentFormValues = {
  payment_proof_file_id: string
  payment_method: string
  promo_code?: string
}
```

### Summary

`GET /api/registrations/me/summary`

### Submit Verification

`POST /api/registrations/me/submit-verification`

## File Upload API

### Provider Auth

`GET /api/imagekit-auth`

### Register File

`POST /api/files`

Input:
```typescript
type FilePayload = {
  file_id: string
  url: string
  purpose: string
}
```

Response:
```typescript
type FileData = {
  id: string
  fileId: string
  url: string
  purpose: string
}
```

## Frontend state management

### Yang disimpan di localStorage:

- `auth_token` — Sanctum Bearer token.
- CSRF token dari meta tag (untuk web routes).

### Yang di-fetch dari API setiap kali:

- Registration context (`/api/registrations/me/context`).
- Data per halaman (team, members, documents, payment).

### Yang tidak boleh menjadi source of truth:

- Selected Competition/Batch (harus dari DB).
- Current registration phase (harus dari DB).
- Team/Registration status.
- Member final state setelah submit.
- Payment verification.
- Current Stage.

## Error mapping

| HTTP Status | Penanganan Frontend |
|---|---|
| 200 | Sukses, render data |
| 201 | Created, redirect sesuai redirectTo |
| 401 | Hapus token, redirect login |
| 403 | Tampilkan "Tidak punya akses" |
| 404 | Tampilkan "Tidak ditemukan" |
| 422 | Parse validation errors per field |
| 429 | Tampilkan retry countdown dari Retry-After header |
| 500 | Tampilkan "Terjadi kesalahan" + request ID |

## Form behavior

- React Hook Form + Zod untuk validasi client-side.
- Backend FormRequest tetap validasi authoritative.
- Disable submit saat processing.
- Backend tetap idempotent.

## Test contract

- Unit test untuk setiap service.
- Feature test untuk setiap endpoint API.
- Typecheck memastikan type frontend cocok dengan response API.
- Integration test untuk flow lengkap (register → verify → selection → team → members → documents → payment).

## Pemisahan dashboard Team dan Admin

- `GET /api/dashboard/summary` tetap khusus Team dan berisi progres satu pendaftaran, redirect, payment, serta next action.
- UI Admin tidak menggunakan atau menghitung agregat dari endpoint Team maupun satu halaman pagination Team.
- Summary Admin berikutnya menggunakan endpoint terpisah `GET /api/admin/dashboard/summary` dengan guard dan data role-aware.
- Sebelum endpoint tersebut tersedia, kartu summary dan antrean pada Admin Dashboard tampil sebagai placeholder, bukan angka mock.
