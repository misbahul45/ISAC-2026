# Domain, State Machine, dan Roadmap

## Domain source of truth

```text
Team
└── Registration
    ├── Competition
    │   └── payment_flow
    └── Batch
        ├── price
        └── module_file_id

Team
├── currentStage
├── submissions
└── examAttempts
```

Tidak ada `competition.price`, `team.price`, atau `stage.price`. Penambahan immutable historical price snapshot hanya boleh dilakukan melalui requirement database terpisah. Sampai saat itu, semua quote memakai Batch yang terikat pada Registration.

## State registrasi dan pembayaran

### Olimpiade

```text
Select Competition + Batch
→ WAITING_PAYMENT
→ upload proof
→ WAITING_VERIFICATION
→ Admin verifies Team and payment
→ VERIFIED
→ Team.currentStage = first active Stage
```

### Business competition

```text
Select Competition + Batch
→ initial data verification without payment
→ VERIFIED
→ Preliminary
→ Admin advances to Semifinal
→ WAITING_PAYMENT + paymentForStage=Semifinal
→ WAITING_VERIFICATION
→ Admin verifies payment
→ VERIFIED + Team.currentStage=Semifinal
```

`currentStage` tidak dipindahkan sebelum payment checkpoint selesai. Dashboard karena itu wajib membaca `paymentForStage` secara terpisah.

## State activity UI

UI boleh menurunkan state berikut tanpa membuat enum backend baru:

- `AVAILABLE`: Stage/Exam dapat dibuka.
- `UPCOMING`: waktu Exam belum mulai.
- `ENDED`: waktu Exam sudah lewat.
- `COMPLETED`: Attempt/Submission final sudah selesai.
- `PAYMENT_REQUIRED`: target Stage menunggu pembayaran.
- `PAYMENT_REVIEW`: bukti pembayaran sedang diperiksa.
- `LOCKED`: authorization atau prasyarat belum terpenuhi.

Backend tetap mengirim fakta domain; frontend hanya menerjemahkannya menjadi presentasi.

## Roadmap deliverable

### Phase 0 — foundation

- Unified dashboard dan shell routes.
- Batch pricing dan registration selection.
- Timeline seed resmi.
- Authorization shell tests.

Exit criteria: Team tidak dapat membuka Exam/Stage milik Competition lain dan dashboard tidak mengekspos answer key.

### Phase 1 — admin content

- Stage CRUD dengan transition guards.
- Exam CRUD dan schedule validation.
- Question CRUD, ordering, activation, dan import preview.
- Publish readiness checklist.

Exit criteria: Admin dapat menyiapkan ujian tanpa menyentuh database manual; exam belum dapat dipublish bila question invalid.

### Phase 2 — Exam Engine

- Attempt bootstrap dan server clock.
- Question navigation dan autosave.
- Heartbeat, reconnect, submit, auto-submit.
- Server-side scoring dan result visibility.

Exit criteria: refresh/reconnect tidak kehilangan jawaban dan submit ganda tidak menggandakan hasil.

### Phase 3 — integrity

- Event batch ingestion.
- Rule-based suspicious scoring.
- Admin integrity review dan evidence timeline.
- Privacy copy, retention, dan false-positive handling.

Exit criteria: event duplicate aman, clock client tidak dipercaya, dan flag tidak otomatis mendiskualifikasi.

### Phase 4 — Submission Engine

- Draft, upload, replace, submit, review, revision.
- Payment checkpoint pada target Stage.
- Batch module/case access.

Exit criteria: satu Submission per Team+Stage, file ownership aman, dan payment lock tidak dapat dilewati.

### Phase 5 — bulk operations

- Bulk qualification preview dan asynchronous execution.
- Announcement targeting dan delivery status.
- Reconciliation dan rollback playbook.

Exit criteria: operator dapat melihat dampak sebelum eksekusi dan setiap Team mempunyai audit result.

### Phase 6 — event readiness

- Load test, security test, backup/restore drill.
- Dashboard and attempt observability.
- Incident runbook dan manual override policy.

## Definition of done lintas phase

- Authorization test untuk happy path dan cross-tenant UUID.
- Idempotency test untuk semua mutation/retry.
- No secret answer material pada Team API, logs, atau browser bundle.
- API docs dan OpenAPI collection diperbarui.
- Loading, error, empty, and retry UI tersedia.
- Mobile viewport dan keyboard navigation diuji.
- Audit log mencatat actor, subject, before/after, reason, request ID, dan timestamp.
