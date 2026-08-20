# Planned API Contracts

Semua endpoint memakai envelope existing:

```json
{
  "status": "success",
  "message": "...",
  "data": {},
  "metadata": {},
  "error": null
}
```

Error memakai HTTP status benar, machine-readable code, field details bila validation error, dan request ID. Path di bawah adalah target contract; endpoint bertanda **existing** sudah tersedia saat plan dibuat.

## Dashboard

| Method | Path | Status | Purpose |
| --- | --- | --- | --- |
| GET | `/api/dashboard/summary` | existing | Team, Registration, Batch price, Stage, activities, payment state |
| GET | `/api/dashboard/exams/{exam}` | existing | Authorized Exam shell metadata |
| GET | `/api/dashboard/stages/{stage}` | existing | Authorized Submission/payment Stage shell |

Dashboard Exam response tidak boleh mempunyai `questions` atau answer key.

## Team Exam

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/exams/{exam}/attempts` | Create or resume eligible Attempt |
| GET | `/api/exam-attempts/{attempt}` | Bootstrap safe questions, answers, server clock |
| PUT | `/api/exam-attempts/{attempt}/answers/{question}` | Idempotent autosave |
| POST | `/api/exam-attempts/{attempt}/heartbeat` | Server time, deadline, connection/device state |
| POST | `/api/exam-attempts/{attempt}/events/batch` | Integrity events batch |
| POST | `/api/exam-attempts/{attempt}/submit` | Finalize Attempt idempotently |
| GET | `/api/exam-attempts/{attempt}/result` | Result if visibility policy allows |

### Create/resume Attempt request

```json
{
  "deviceId": "client-installation-uuid",
  "clientCapabilities": {
    "fullscreen": true,
    "visibilityApi": true
  },
  "idempotencyKey": "uuid"
}
```

Response menyertakan `attemptId`, `resumed`, `serverNow`, `expiresAt`, dan bootstrap URL. Backend tidak mempercayai capability sebagai bukti keamanan.

### Autosave request

```json
{
  "answer": "B",
  "selectedOptions": ["B"],
  "clientRevision": 7,
  "answeredAtClient": "2026-10-10T03:15:20.000Z",
  "idempotencyKey": "uuid"
}
```

Response:

```json
{
  "questionId": "uuid",
  "serverRevision": 7,
  "savedAt": "2026-10-10T03:15:21.000Z",
  "remainingSeconds": 1812
}
```

## Team Submission

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/stages/{stage}/submission` | Current Team submission or null |
| POST | `/api/stages/{stage}/submission` | Create draft |
| PATCH | `/api/submissions/{submission}` | Update draft metadata/file |
| POST | `/api/submissions/{submission}/submit` | Submit idempotently |
| POST | `/api/submissions/{submission}/revision` | Resubmit requested revision |
| GET | `/api/batches/{batch}/module` | Authorized Registration Batch module |

Mutation backend memeriksa current Stage, Competition, payment lock, deadline, file ownership, dan purpose `SUBMISSION`.

## Payment dan receipt

Existing quote/upload tetap dipakai:

| Method | Path | Status |
| --- | --- | --- |
| GET | `/api/registrations/me/payment` | existing |
| POST | `/api/registrations/me/payment/quote` | existing |
| POST | `/api/registrations/me/payment` | existing |
| GET | `/api/registrations/{registration}/payment-receipt.pdf` | planned |

Receipt endpoint hanya untuk Team pemilik atau Admin berizin dan hanya setelah verified.

## Admin Stage

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/competitions/{competition}/stages` | Ordered Stage list |
| POST | `/api/admin/competitions/{competition}/stages` | Create Stage |
| PATCH | `/api/admin/stages/{stage}` | Update Stage |
| DELETE | `/api/admin/stages/{stage}` | Guarded delete |
| PUT | `/api/admin/competitions/{competition}/stages/order` | Atomic reorder |

## Admin Exam and question

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/api/admin/stages/{stage}/exams` | List/create Exam |
| GET/PATCH/DELETE | `/api/admin/exams/{exam}` | Detail/update/delete |
| POST | `/api/admin/exams/{exam}/publish` | Validate and publish |
| POST | `/api/admin/exams/{exam}/unpublish` | Guarded unpublish |
| GET/POST | `/api/admin/exams/{exam}/questions` | List/create questions |
| GET/PATCH/DELETE | `/api/admin/questions/{question}` | Question CRUD |
| PUT | `/api/admin/exams/{exam}/questions/order` | Atomic order |
| POST | `/api/admin/exams/{exam}/questions/import/preview` | Validate import |
| POST | `/api/admin/exams/{exam}/questions/import/commit` | Idempotent commit |

Admin resources dapat memuat correct answer; Team resources tidak menggunakan class resource yang sama.

## Admin Attempt review

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/exam-attempts` | Filter by Exam, Team, finished, flagged, score |
| GET | `/api/admin/exam-attempts/{attempt}` | Answers and scoring detail |
| GET | `/api/admin/exam-attempts/{attempt}/integrity` | Event timeline and rule evidence |
| POST | `/api/admin/exam-attempts/{attempt}/integrity/review` | Confirm/clear/escalate flag |
| POST | `/api/admin/exam-attempts/{attempt}/score-adjustment` | Audited manual adjustment |
| POST | `/api/admin/exam-attempts/{attempt}/extra-time` | Audited deadline extension |

## Admin Submission review

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/submissions` | Filter queue |
| GET | `/api/admin/submissions/{submission}` | Detail/file/history |
| POST | `/api/admin/submissions/{submission}/review` | Approve/reject/revision + score/feedback |

## Bulk advancement

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/admin/competitions/{competition}/stages/{stage}/advancements/preview` | Validate selection, no writes |
| POST | `/api/admin/competitions/{competition}/stages/{stage}/advancements` | Start idempotent job |
| GET | `/api/admin/bulk-actions/{bulkAction}` | Job progress and aggregate |
| GET | `/api/admin/bulk-actions/{bulkAction}/results` | Paginated per-Team result |
| POST | `/api/admin/bulk-actions/{bulkAction}/retry` | Retry failed items |

## Announcement

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/api/admin/announcements` | List/create draft |
| GET/PATCH/DELETE | `/api/admin/announcements/{announcement}` | Manage draft |
| POST | `/api/admin/announcements/{announcement}/preview` | Resolve audience/sample |
| POST | `/api/admin/announcements/{announcement}/publish` | Snapshot recipients and queue |
| GET | `/api/announcements` | Team inbox |
| POST | `/api/announcements/{announcement}/read` | Idempotent read marker |

## Cross-cutting headers

- `Authorization: Bearer ...` mengikuti auth existing.
- `Idempotency-Key` wajib untuk create Attempt, submit, import commit, bulk execute, publish, dan high-impact Admin mutation.
- `X-Request-ID` diterima/dibuat server dan dikembalikan.
- Rate-limit headers dikembalikan pada heartbeat/event endpoints.
- `Cache-Control: no-store` untuk Exam bootstrap, answer, result private, dan receipt.
