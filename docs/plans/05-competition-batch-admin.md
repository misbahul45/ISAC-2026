# Competition, Batch, and Admin Operations Plan

## Tujuan

Admin mengelola Competition, Batch, data Team, payment verification, dan perpindahan Stage. Semua operasi berada di area guard admin serta menggunakan Policy.

## Layer

Setiap domain memakai:

- FormRequest untuk validasi input.
- Controller tipis untuk HTTP/Inertia.
- Policy untuk authorization.
- Action atau Service untuk transaksi dan business rules.
- Repository/query object hanya jika query kompleks memerlukannya.
- Resource atau Inertia data transformer untuk output.

Controller tidak langsung mengubah status kompleks.

## Competition CRUD

### Halaman dan endpoint

- GET /admin/competitions.
- GET /admin/competitions/create.
- POST /admin/competitions.
- GET /admin/competitions/{competition}/edit.
- PATCH /admin/competitions/{competition}.
- DELETE /admin/competitions/{competition}.

Opsional JSON endpoint untuk selector:

- GET /api/competitions/open.

### Input

- name.
- slug.
- description.
- type.
- payment_flow.
- start_date.
- end_date.
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

Competition dengan Registration tidak dapat dihapus permanen. DELETE berarti soft delete hanya jika tidak merusak Registration aktif; jika sudah dipakai, lebih tepat ubah status.

## Batch CRUD

### Halaman dan endpoint

- GET /admin/competitions/{competition}/batches.
- GET /admin/competitions/{competition}/batches/create.
- POST /admin/competitions/{competition}/batches.
- GET /admin/batches/{batch}/edit.
- PATCH /admin/batches/{batch}.
- DELETE /admin/batches/{batch}.

### Input

- name.
- slug.
- description.
- start_date.
- end_date.
- price.
- quota.
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
- Harga tidak dapat diubah sembarangan jika sudah ada payment submission; butuh ability override dan audit.

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

Halaman:

- GET /admin/teams.
- GET /admin/teams/{team}.

Filter:

- Competition.
- Batch.
- Team.status.
- Registration.status.
- Stage.
- Institusi/provinsi.
- submitted date.

Detail memuat:

- Account Team.
- Registration dan progress.
- Member.
- Document/twibbon links.
- Payment proof.
- Status dan verification notes.
- Current Stage.
- Riwayat tindakan Admin jika audit table ditambahkan.

Query memakai pagination, eager loading, dan index yang relevan.

## Verifikasi data Team

Endpoint:

- POST /admin/teams/{team}/verify.
- POST /admin/teams/{team}/request-revision.
- POST /admin/teams/{team}/reject.

Verify:

- Hanya Team WAITING_VERIFICATION.
- Set status VERIFIED.
- Isi verified_by dan verified_at.
- Bersihkan revision_step dan note jika sesuai.
- Panggil activation service.

Request revision:

- Input revision_step dan verification_note.
- Set status REVISION_REQUIRED.
- Team diarahkan ke fase terkait.

Reject:

- Input verification_note wajib.
- Set status REJECTED.
- Tidak menghapus Registration.

Semua operasi idempotent dan melalui Policy ability.

## Verifikasi pembayaran

Endpoint:

- POST /admin/registrations/{registration}/payment/verify.
- POST /admin/registrations/{registration}/payment/request-revision.
- POST /admin/registrations/{registration}/payment/reject.

Verify:

- Hanya WAITING_VERIFICATION.
- Proof harus tersedia.
- Set status VERIFIED.
- Isi payment_verified_by dan payment_verified_at.
- Bersihkan rejection reason.
- Panggil activation atau Stage payment completion service.

Request revision:

- Alasan wajib.
- Set status REVISION_REQUIRED.
- Team diarahkan ke Payment.

Reject:

- Alasan wajib.
- Set status REJECTED.

Auto-verification non-Olympiad hanya dilakukan service saat membuat Registration. Admin endpoint tidak dipakai.

## Stage movement

Endpoint konseptual:

- POST /admin/teams/{team}/stage/qualify.
- POST /admin/teams/{team}/stage/advance.

Untuk Business Plan/BIT menuju Semifinal:

- Jangan langsung advance.
- Buka payment gate pada Registration.
- Set payment_for_stage_id.
- Team baru pindah setelah pembayaran VERIFIED.

Untuk Stage tanpa payment gate:

- Validasi Stage tujuan merupakan next order.
- Update current_stage_id dalam transaction.

Manual arbitrary Stage jump membutuhkan ability khusus dan audit reason.

## Audit log

Direkomendasikan tabel admin_audit_logs:

- id.
- admin_id.
- action.
- subject_type.
- subject_id.
- before_data JSON dengan data sensitif disaring.
- after_data JSON.
- reason.
- request_id.
- created_at.

Action yang dicatat:

- Competition create/update/status/delete.
- Batch create/update/status/delete.
- Team verify/revision/reject.
- Payment verify/revision/reject.
- Stage qualify/advance/override.
- Perubahan Competition/Batch pada Registration.

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

Matrix final dapat diperluas, tetapi Policy wajib menjadi enforcement backend.

## Validation dan error

- Mutation Inertia Admin mengembalikan redirect.
- Conflict status menghasilkan validation/domain error yang dapat dipahami.
- Concurrent verification menggunakan optimistic check pada status atau row lock.
- Resource tidak ditemukan tetap 404.
- Unauthorized tetap 403, bukan disamarkan sebagai sukses.

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

