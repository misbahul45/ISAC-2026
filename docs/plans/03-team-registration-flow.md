# Team Registration Flow Plan

## Sasaran

Registration Team adalah wizard multi-step via JSON API. Setiap GET mengembalikan data step terkini. Setiap mutation menyimpan data dan mengembalikan data terbaru + `redirectTo` sebagai petunjuk navigasi. Frontend mengelola navigasi berdasarkan response API.

## Prasyarat

- User authenticated sebagai Team (memiliki Bearer token).
- `principalType` dari login adalah `TEAM`.
- Team.email_verified_at sudah terisi.
- Team belum memiliki Registration lain (kecuali untuk resume).
- Competition dan Batch yang dipilih masih menerima pendaftaran.

## Endpoint Registration

Semua endpoint berada di prefix `/api/registrations/me`, dilindungi middleware `auth:sanctum`.

### Fase 0: Account dan email

Ditangani oleh Auth API:
- `POST /api/auth/register` — buat akun.
- `POST /api/auth/verify-email/resend` — kirim OTP.
- `POST /api/auth/verify-email` — verifikasi email.

Setelah email diverifikasi, frontend mengarahkan Team ke pemilihan Competition.

### Fase 1: Competition dan Batch

#### GET /api/competitions?status=REGISTRATION_OPEN

Mengembalikan daftar Competition yang sedang menerima pendaftaran, masing-masing dengan Batch yang OPEN.

Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "OLIMPIADE",
      "slug": "olimpiade",
      "type": "OLIMPIADE",
      "description": "...",
      "paymentFlow": "UPFRONT",
      "startDate": "2026-06-01T00:00:00.000Z",
      "endDate": "2026-08-01T00:00:00.000Z",
      "status": "REGISTRATION_OPEN",
      "openBatches": [
        {
          "id": "uuid",
          "name": "Gelombang 1",
          "startAt": "2026-06-01T00:00:00.000Z",
          "endAt": "2026-07-01T00:00:00.000Z",
          "price": 50000,
          "quota": 100,
          "remainingQuota": 45,
          "status": "OPEN"
        }
      ]
    }
  ]
}
```

#### GET /api/registrations/me/context

Mengembalikan data Registration existing jika ada, untuk resume wizard.

Response:
```json
{
  "status": "success",
  "data": {
    "registration": null,
    "team": { "id": "uuid", "name": null, "status": "INCOMPLETE", "emailVerifiedAt": "2026-07-01T..." },
    "progress": {
      "teamCompleted": false,
      "membersCompleted": false,
      "documentsCompleted": false,
      "submitted": false
    }
  }
}
```

Jika registration sudah ada, kembalikan data registration + competition + batch.

#### POST /api/registrations/me/selection

Input:
```json
{
  "competition_id": "uuid",
  "batch_id": "uuid"
}
```

Backend:
1. Lock row Batch.
2. Validasi Batch milik Competition.
3. Validasi Competition dan Batch masih open.
4. Validasi tanggal dan kuota.
5. Pastikan Team belum memiliki Registration.
6. Buat Registration.
7. Naikkan cached current_registrations.

Response:
```json
{
  "status": "success",
  "message": "Competition dan Batch berhasil dipilih.",
  "data": {
    "registration": { "id": "uuid", "status": "WAITING_PAYMENT", ... },
    "redirectTo": "/registration/team"
  }
}
```

Status awal:
- OLIMPIADE menjadi WAITING_PAYMENT.
- BUSINESS_PLAN dan BUSINESS_IT_CASE menjadi VERIFIED oleh sistem.

Setelah Registration dibuat, Team tidak dapat mengganti Competition atau Batch sendiri.

### Fase 2: Team

#### GET /api/registrations/me/team

Mengembalikan data Team saat ini untuk form.

Response:
```json
{
  "status": "success",
  "data": {
    "name": null,
    "phone": null,
    "school_name": null,
    "school_province": null,
    "school_city": null,
    "school_address": null,
    "competition_summary": { "name": "OLIMPIADE", "type": "OLIMPIADE" }
  }
}
```

#### PATCH /api/registrations/me/team

Input:
```json
{
  "name": "Team Alpha",
  "phone": "08123456789",
  "school_name": "SMA Negeri 1",
  "school_province": "Jawa Timur",
  "school_city": "Surabaya",
  "school_address": "Jl. Contoh No. 1"
}
```

Tidak ada document_url, twibbon_url, atau payment pada fase ini.

Backend:
1. Ambil Team dari guard.
2. Validasi field.
3. Update Team.
4. Isi Registration.team_completed_at.
5. Jika resubmit revisi TEAM, bersihkan revision_step dan ubah Team.status kembali WAITING_VERIFICATION.

Response:
```json
{
  "status": "success",
  "data": {
    "redirectTo": "/registration/biodata"
  }
}
```

### Fase 3: Member

#### GET /api/registrations/me/members

Mengembalikan Member existing dan constraint.

Response:
```json
{
  "status": "success",
  "data": {
    "competitionType": "OLIMPIADE",
    "minMembers": 1,
    "maxMembers": 1,
    "members": [],
    "revisionNote": null
  }
}
```

#### PUT /api/registrations/me/members

Input — seluruh daftar final Member, bukan incremental:
```json
{
  "members": [
    {
      "id": null,
      "name": "John Doe",
      "role": "LEADER",
      "email": "john@example.com",
      "phone": "08123456789",
      "education_level": "SMA/SMK",
      "major": "IPA",
      "faculty": null,
      "student_id": "12345",
      "birth_date": "2006-01-15",
      "sort_order": 1
    }
  ]
}
```

Jumlah Member:
- OLIMPIADE: tepat 1.
- BUSINESS_PLAN: 2 atau 3.
- BUSINESS_IT_CASE: 2 atau 3.

Role: tepat satu LEADER, sisanya MEMBER.

Backend dalam transaction:
1. Pastikan fase Team selesai (team_completed_at terisi).
2. Validasi jumlah berdasarkan Competition.
3. Validasi tepat satu LEADER.
4. Validasi email dan student identity.
5. Upsert Member milik Team.
6. Soft delete Member lama yang tidak ada di payload.
7. Normalisasi sort_order.
8. Isi members_completed_at.
9. Tangani resubmit revisi MEMBERS.

Response:
```json
{
  "status": "success",
  "data": {
    "redirectTo": "/registration/documents"
  }
}
```

### Fase 4: Documents

#### GET /api/registrations/me/documents

Response:
```json
{
  "status": "success",
  "data": {
    "document_url": null,
    "twibbon_url": null,
    "revisionNote": null
  }
}
```

#### PATCH /api/registrations/me/documents

Input:
```json
{
  "document_url": "https://drive.google.com/file/d/...",
  "twibbon_url": "https://drive.google.com/file/d/..."
}
```

Keduanya wajib Google Drive dan HTTPS.

Backend:
1. Pastikan Team dan Member selesai.
2. Validasi URL.
3. Update Team.
4. Isi documents_completed_at.

Response Olympiad:
```json
{ "status": "success", "data": { "redirectTo": "/registration/payment" } }
```

Response non-Olympiad (finalisasi otomatis):
```json
{ "status": "success", "data": { "redirectTo": "/registration/waiting-verification" } }
```

Finalisasi non-Olympiad:
- Registration.status tetap VERIFIED.
- Registration.submitted_at diisi.
- Team.status menjadi WAITING_VERIFICATION.
- revision metadata dibersihkan.

### Fase 5: Payment Olympiad

#### GET /api/registrations/me/payment

Response:
```json
{
  "status": "success",
  "data": {
    "amount": 50000,
    "payment_methods": [ "BANK_TRANSFER", "QRIS" ],
    "payment_instructions": "Transfer ke BNI 123456 a.n. ISAC",
    "payment_status": "WAITING_PAYMENT",
    "existing_proof": null,
    "rejection_reason": null
  }
}
```

#### POST /api/registrations/me/payment

Input:
```json
{
  "payment_proof_file_id": "uuid",
  "payment_method": "BANK_TRANSFER",
  "transaction_id": "TRX12345"
}
```

Backend:
1. Pastikan payment gate aktif.
2. Pastikan File record ada.
3. Ambil harga dari Batch (abaikan nominal client).
4. Set amount_paid, payment_submitted_at.
5. Set status WAITING_VERIFICATION.
6. Untuk Olympiad initial: isi submitted_at dan ubah Team.status jadi WAITING_VERIFICATION.

Response:
```json
{
  "status": "success",
  "data": {
    "redirectTo": "/registration/waiting-verification"
  }
}
```

### Summary

#### GET /api/registrations/me/summary

Mengembalikan ringkasan registration untuk halaman review/submit.

### Submit

#### POST /api/registrations/me/submit-verification

Untuk non-Olympiad yang belum otomatis ter-submit di fase Documents, atau untuk resubmit setelah revisi.

## Team verification (Admin)

`POST /api/admin/teams/{team}/verify`
`POST /api/admin/teams/{team}/request-revision`
`POST /api/admin/teams/{team}/reject`

Transisi:
- WAITING_VERIFICATION ke VERIFIED.
- WAITING_VERIFICATION ke REVISION_REQUIRED.
- WAITING_VERIFICATION ke REJECTED.
- REVISION_REQUIRED ke WAITING_VERIFICATION setelah Team resubmit.

## Payment verification (Admin)

`POST /api/admin/registrations/{registration}/payment/verify`
`POST /api/admin/registrations/{registration}/payment/request-revision`
`POST /api/admin/registrations/{registration}/payment/reject`

## Activation

Setiap verifikasi Team atau Registration memanggil activation service.

Initial activation terjadi jika:
- submitted_at terisi.
- Team.status VERIFIED.
- Registration.status VERIFIED.
- current_stage_id masih null.

Service memilih Stage ber-order paling awal pada Competition terkait.

## Flow OLIMPIADE

1. POST /api/auth/register → POST /api/auth/verify-email
2. GET /api/competitions → POST /api/registrations/me/selection (OLIMPIADE)
3. Registration WAITING_PAYMENT
4. PATCH /api/registrations/me/team
5. PUT /api/registrations/me/members (1 Member LEADER)
6. PATCH /api/registrations/me/documents
7. POST /api/registrations/me/payment
8. Admin verifikasi data + payment
9. Keduanya VERIFIED → Activation → Stage awal

## Flow Business Plan / Business IT Case

1. POST /api/auth/register → POST /api/auth/verify-email
2. GET /api/competitions → POST /api/registrations/me/selection
3. Registration langsung VERIFIED (payment gate)
4. PATCH /api/registrations/me/team
5. PUT /api/registrations/me/members (2-3 Member)
6. PATCH /api/registrations/me/documents → auto finalisasi
7. WAITING_VERIFICATION (tanpa payment)
8. Admin verifikasi data
9. VERIFIED → Activation → Stage awal

## Payment Semifinal

Saat Admin menyatakan Team lolos:
1. Jangan langsung pindahkan current_stage_id.
2. Set Registration.status WAITING_PAYMENT.
3. Isi payment_required_at dan payment_for_stage_id.
4. `GET /api/registrations/me/context` mengembalikan `redirectTo: /registration/payment`.
5. Team upload proof via `POST /api/registrations/me/payment`.
6. Admin verifikasi.
7. Setelah VERIFIED, pindahkan current_stage_id ke Stage tujuan.

## Concurrency dan idempotency

- Selection memakai transaction dan lock Batch.
- Finalisasi Member memakai satu transaction.
- Submit payment mencegah duplikasi request.
- Admin verify bersifat idempotent.
- Activation Stage bersifat idempotent.
- Double click frontend tidak membuat Registration, Member, atau payment submission ganda.

## Ringkasan endpoint

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | /api/competitions | - | Daftar Competition open |
| GET | /api/registrations/me/context | sanctum | Status registration saat ini |
| POST | /api/registrations/me/selection | sanctum | Pilih Competition & Batch |
| GET | /api/registrations/me/team | sanctum | Data form Team |
| PATCH | /api/registrations/me/team | sanctum | Simpan data Team |
| GET | /api/registrations/me/members | sanctum | Data Member existing |
| PUT | /api/registrations/me/members | sanctum | Finalisasi seluruh Member |
| GET | /api/registrations/me/documents | sanctum | Data dokumen |
| PATCH | /api/registrations/me/documents | sanctum | Simpan dokumen |
| GET | /api/registrations/me/payment | sanctum | Info pembayaran |
| POST | /api/registrations/me/payment | sanctum | Submit bukti bayar |
| GET | /api/registrations/me/summary | sanctum | Ringkasan registration |
| POST | /api/registrations/me/submit-verification | sanctum | Submit final |
