# Bulk Team Advancement dan Announcement Plan

## Tujuan

Admin perlu menetapkan banyak Team lolos sekaligus, melihat efek payment checkpoint sebelum eksekusi, lalu mengirim pengumuman yang dapat dilacak. Operasi ini tidak boleh berupa loop request dari browser.

## Bulk advancement workflow

```text
Filter Competition + current Stage
→ pilih Team atau upload selection
→ preview validation
→ tampilkan eligible/ineligible + reason
→ confirm dengan idempotency key
→ asynchronous job
→ per-Team result + audit
→ announcement optional
```

## Preview rules

Untuk setiap Team backend memeriksa:

- Registration milik Competition yang sama;
- Team dan Registration eligible;
- target Stage urut setelah current Stage;
- target belum current;
- tidak ada payment/revision conflict;
- Semifinal payment flow memicu WAITING_PAYMENT dan paymentForStage;
- Batch price tersedia dari Registration;
- request tidak menggandakan advancement yang sudah selesai.

Preview response mengelompokkan:

- `eligible`;
- `alreadyAtTarget`;
- `requiresPayment`;
- `blocked` beserta machine-readable reason;
- aggregate by Batch dan original amount untuk pengecekan operator.

Preview tidak mengubah state.

## Execution

- Browser mengirim selection token dari preview, bukan hasil modifikasi manual.
- Job memproses per Team dengan transaction dan row lock.
- Satu Team gagal tidak menyembunyikan hasil Team lain.
- Job menyimpan total, succeeded, failed, skipped, dan per-Team reason.
- Retry hanya mengulang failed/retryable item.
- Idempotency key scoped ke Competition+target Stage+operator.
- Cancel hanya tersedia sebelum item mulai; rollback advancement memerlukan operation tersendiri dan reason.

## Announcement model yang dibutuhkan

Schema announcement belum ada. Rencanakan:

- `announcements`: title, body, audience type, Competition, Stage nullable, publishAt, createdBy, status;
- `announcement_recipients`: announcement, Team, channel status, deliveredAt, readAt, error;
- optional template key dan safe variables;
- audit log.

Audience dapat berupa:

- seluruh Team Competition;
- Team pada Stage tertentu;
- result dari bulk action;
- daftar Team eksplisit.

## Delivery channels

- Dashboard inbox adalah source yang dapat dibaca ulang.
- Email bersifat notification, bukan satu-satunya sumber pengumuman.
- Queue retry memakai backoff dan dead-letter visibility.
- Preview menampilkan recipient count dan sample render.
- Publish tidak mengirim secret result milik Team lain.

## Result privacy

- Team hanya melihat statusnya sendiri.
- Public leaderboard/announcement adalah feature terpisah dengan approval.
- Bulk API tidak mengembalikan email/member PII yang tidak dibutuhkan UI.
- Export harus role-protected, time-limited, dan diaudit.

## Operator safeguards

- Confirmation menyebut Competition, from/to Stage, jumlah Team, jumlah payment checkpoint, dan Batch breakdown.
- Large action memerlukan typed confirmation phrase atau second approver sesuai policy.
- Tombol disabled selama request submit, tetapi idempotency tetap backend-driven.
- Audit report dapat diunduh setelah job selesai.

## Acceptance tests

- Mixed Competition IDs tidak lolos preview.
- Duplicate execute dengan key sama menghasilkan job/result sama.
- Concurrent advancement Team yang sama tidak menggandakan payment requirement.
- BPC/BIC Semifinal memakai harga Batch masing-masing Team.
- Team yang sudah di target Stage menjadi skipped, bukan error ambigu.
- Announcement recipient sesuai snapshot job, walau filter berubah setelah publish.
- Retry email tidak membuat dashboard announcement duplicate.
