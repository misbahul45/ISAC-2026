# Competition, Batch, and Admin Operations Plan

## Tujuan

Admin mengelola Competition, Batch, data Team, payment verification, dan perpindahan Stage. Semua operasi melalui JSON API endpoint dengan guard admin (Sanctum) dan Policy.

## Layer

Setiap domain memakai:

- FormRequest untuk validasi input.
- Controller tipis untuk HTTP API.
- Policy untuk authorization.
- Service untuk transaksi dan business rules.
- Repository/query object hanya jika query kompleks memerlukannya.
- Resource untuk output response.

Controller tidak langsung mengubah status kompleks.

## Competition CRUD (Admin)

### Endpoint

Semua endpoint prefix `/api/admin/competitions`, middleware `auth:sanctum` + guard `admins`.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/admin/competitions | List semua Competition (filter, pagination) |
| POST | /api/admin/competitions | Create Competition |
| GET | /api/admin/competitions/{competition} | Detail Competition |
| PATCH | /api/admin/competitions/{competition} | Update Competition |
| DELETE | /api/admin/competitions/{competition} | Soft delete Competition |
| PATCH | /api/admin/competitions/{competition}/status | Transition status |

### Input

- name, slug, description.
- type (OLIMPIADE, BUSINESS_PLAN, BUSINESS_IT_CASE).
- payment_flow (UPFRONT, SEMIFINAL).
- start_date, end_date.
- status.

### Rules

- type menggunakan canonical enum.
- OLIMPIADE harus payment_flow UPFRONT.
- BUSINESS_PLAN dan BUSINESS_IT_CASE harus payment_flow SEMIFINAL.
- end_date setelah start_date.
- slug dinormalisasi server.
- Status transition tidak bebas.

### Transition Competition

- DRAFT ke REGISTRATION_OPEN.
- REGISTRATION_OPEN ke REGISTRATION_CLOSED.
- REGISTRATION_CLOSED ke ONGOING.
- ONGOING ke COMPLETED.
- Reopen hanya melalui ability khusus dan validasi periode.

Competition dengan Registration tidak dapat dihapus permanen.

## Batch CRUD (Admin)

### Endpoint

Semua endpoint prefix `/api/admin/competitions/{competition}/batches`.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/admin/competitions/{competition}/batches | List Batch dalam Competition |
| POST | /api/admin/competitions/{competition}/batches | Create Batch |
| GET | /api/admin/batches/{batch} | Detail Batch |
| PATCH | /api/admin/batches/{batch} | Update Batch |
| DELETE | /api/admin/batches/{batch} | Soft delete Batch |

### Input

- name, slug, description.
- start_date, end_date.
- price, quota.
- status.
- module_file_id.

competition_id berasal dari scoped route, bukan input bebas.

### Rules

- Batch berada dalam periode yang masuk akal terhadap Competition.
- end_date setelah start_date.
- price minimum nol.
- quota minimum satu jika tidak null.
- module_file_id harus File valid.
- slug unique dalam Competition.
- Batch OPEN hanya jika Competition menerima registration.
- Batch FULL dapat ditentukan otomatis ketika kuota tercapai.
- Batch dengan Registration tidak dapat dipindah ke Competition lain.
- Harga tidak dapat diubah sembarangan jika sudah ada payment submission.

### Quota concurrency

Selection Registration:
1. Transaction.
2. SELECT Batch for update.
3. Hitung atau validasi current_registrations.
4. Tolak jika penuh.
5. Buat Registration.
6. Increment counter.

Scheduled reconciliation membandingkan cached counter dengan count Registration aktual.

## Admin Team list

### Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/admin/teams | List Team dengan filter |
| GET | /api/admin/teams/{team} | Detail Team + Registration + Member |

Filter:
- Competition, Batch, Team.status, Registration.status, Stage, provinsi, submitted date.

Detail memuat:
- Account Team, Registration progress, Member.
- Document/twibbon links, Payment proof.
- Status dan verification notes, Current Stage.
- Riwayat tindakan Admin.

Query memakai pagination, eager loading, dan index yang relevan.

## Verifikasi data Team (Admin)

| Method | Endpoint |
|---|---|
| POST | /api/admin/teams/{team}/verify |
| POST | /api/admin/teams/{team}/request-revision |
| POST | /api/admin/teams/{team}/reject |

Verify:
- Hanya Team WAITING_VERIFICATION.
- Set status VERIFIED.
- Isi verified_by dan verified_at.
- Bersihkan revision_step dan note.
- Panggil activation service.

Request revision:
- Input revision_step dan verification_note.
- Set status REVISION_REQUIRED.
- Team diarahkan ke fase terkait via redirectTo.

Reject:
- Input verification_note wajib.
- Set status REJECTED.
- Tidak menghapus Registration.

Semua operasi idempotent dan melalui Policy ability.

## Verifikasi pembayaran (Admin)

| Method | Endpoint |
|---|---|
| POST | /api/admin/registrations/{registration}/payment/verify |
| POST | /api/admin/registrations/{registration}/payment/request-revision |
| POST | /api/admin/registrations/{registration}/payment/reject |

Verify:
- Hanya WAITING_VERIFICATION.
- Proof harus tersedia.
- Set status VERIFIED.
- Isi payment_verified_by dan payment_verified_at.
- Panggil activation atau Stage completion service.

Auto-verification non-Olympiad hanya dilakukan service saat membuat Registration.

## Stage movement (Admin)

| Method | Endpoint |
|---|---|
| POST | /api/admin/teams/{team}/stage/qualify |
| POST | /api/admin/teams/{team}/stage/advance |

Untuk Business Plan/BIT menuju Semifinal:
- Jangan langsung advance.
- Buka payment gate pada Registration (status WAITING_PAYMENT).
- Set payment_for_stage_id.
- Team baru pindah setelah pembayaran VERIFIED.

Untuk Stage tanpa payment gate:
- Validasi Stage tujuan merupakan next order.
- Update current_stage_id dalam transaction.

## Audit log

Tabel admin_audit_logs:

- id, admin_id, action.
- subject_type, subject_id.
- before_data JSON, after_data JSON.
- reason, request_id.
- created_at.

Action yang dicatat:
- Competition create/update/status/delete.
- Batch create/update/status/delete.
- Team verify/revision/reject.
- Payment verify/revision/reject.
- Stage qualify/advance/override.

## Authorization matrix

| Ability | super_admin | admin_registration | admin_payment | judge |
|---|---:|---:|---:|---:|
| Competition CRUD | Ya | View | Tidak | View |
| Batch CRUD | Ya | Ya | View | View |
| View Team | Ya | Ya | Ya | Terbatas |
| Verify Team data | Ya | Ya | Tidak | Tidak |
| Verify payment | Ya | Tidak | Ya | Tidak |
| Advance Stage | Ya | Ya | Tidak | Sesuai rule |
| Review Submission | Ya | Opsional | Tidak | Ya |

Policy wajib menjadi enforcement backend.

## Response format

Semua endpoint mengembalikan format JSON standar:

Sukses:
```json
{
  "status": "success",
  "message": "...",
  "data": {},
  "metadata": {},
  "error": null
}
```

Error:
```json
{
  "status": "error",
  "message": "...",
  "data": null,
  "metadata": {},
  "error": { "code": "...", "details": {} }
}
```

## Test wajib

- CRUD Competition dengan setiap transition valid dan invalid.
- payment_flow sesuai type.
- CRUD Batch scoped ke Competition.
- Batch date, price, quota, dan file validation.
- Concurrent selection tidak melewati quota.
- Admin role matrix.
- Team verify memanggil activation secara benar.
- Payment verify Olympiad.
- Auto-verified non-Olympiad.
- Semifinal payment gate sebelum Stage advance.
- Revision reason dan step wajib.
- Audit actor tercatat.
- Soft delete tidak merusak Registration existing.
