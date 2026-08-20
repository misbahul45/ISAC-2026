# Admin Competition, Stage, Exam, dan Question Management

## Role matrix

Gunakan role existing dan perluas policy secara eksplisit:

| Capability | super_admin | admin_registration | admin_payment | judge |
| --- | --- | --- | --- | --- |
| Competition/Batch CRUD | yes | yes | no | read |
| Stage CRUD/order | yes | yes | no | read |
| Exam/question CRUD | yes | configurable | no | read |
| Publish Exam | yes | configurable | no | no |
| Payment review | yes | no | yes | no |
| Submission/Attempt review | yes | read | no | yes |
| Team correction | yes | yes | no | read |

Policy harus dites; UI hiding bukan authorization.

## Competition dan Batch

Existing Competition/Batch CRUD dipertahankan. Guard tambahan:

- type dan payment flow harus pasangan valid;
- Competition type/payment flow tidak berubah setelah mempunyai Registration;
- Batch price numeric dan tidak diformat di database;
- Batch tidak dapat dihapus bila dipakai Registration;
- date range Batch berada dalam batas Competition atau menghasilkan explicit warning;
- status transition mengikuti state machine existing;
- price edit pada Batch yang sudah dipakai harus menampilkan impact preview karena Registration membaca relasi Batch yang sama.

Keputusan product diperlukan sebelum mengizinkan price edit setelah Registration: tetap mutable mengikuti Batch atau bekukan via historical snapshot migration. Jangan diam-diam membuat snapshot.

## Stage management

UI Admin memerlukan:

- list Stage per Competition, ordered;
- create/edit name, type, description, order, start/end, isActive;
- drag reorder dengan preview order baru;
- conflict warning untuk Team yang sedang berada pada Stage;
- delete guard bila Stage dipakai Team, paymentForStage, Submission, atau Exam;
- timeline visualization untuk overlap/gap tanpa otomatis mengubah data.

`is_active` pada project saat ini berarti eligible untuk progression; jangan dipresentasikan sebagai satu-satunya Stage yang sedang live.

## Exam management

Form Exam mengikuti schema existing:

- stageId;
- title/description;
- startDate/endDate;
- duration;
- passingScore nullable;
- type;
- shuffleQuestions/shuffleOptions;
- showResultImmediately;
- maxAttempts;
- settings yang divalidasi melalui DTO, bukan JSON bebas.

Publish checklist:

- Stage type compatible dan Competition Olimpiade;
- valid schedule dan duration;
- minimal question aktif;
- score maximum lebih dari zero;
- setiap multiple-choice question mempunyai option dan correct answer valid;
- no duplicate order;
- result visibility telah dikonfirmasi;
- integrity policy dipilih.

## Question management

Question editor mendukung existing fields:

- question;
- explanation;
- type;
- options;
- correctAnswer;
- order;
- correct/wrong/empty score;
- difficulty/category/tags;
- isActive.

Security rules:

- answer fields hanya ada pada Admin resource;
- Team resource menggunakan DTO terpisah;
- Admin endpoint tidak pernah dipanggil browser Team;
- logs dan exception context tidak menyimpan full answer key;
- publish mengunci atau membuat version snapshot.

## Bulk question import

Import harus dua tahap:

1. upload + preview validation;
2. confirm commit dengan idempotency key.

Preview menampilkan row number, normalized type, option count, score, dan error. Commit seluruh batch dalam transaction atau menghasilkan per-row result yang eksplisit; jangan sebagian gagal tanpa laporan.

## Audit

Semua create/update/delete/publish merekam:

- admin ID dan role;
- request ID dan idempotency key;
- entity type/ID;
- before/after data;
- reason untuk destructive/high-impact action;
- affected Team/Attempt count bila relevan.

Answer key dapat direduksi atau di-hash pada audit log agar tidak tersebar, tetapi perubahan tetap dapat dibuktikan.

## UI screens yang direncanakan

```text
/admin/competitions
/admin/competitions/{competitionId}/stages
/admin/stages/{stageId}/exams
/admin/exams/{examId}
/admin/exams/{examId}/questions
/admin/exams/{examId}/attempts
```

Gunakan Admin layout/design system existing. Dashboard Team dan 404 portal tidak menjadi referensi untuk generic Admin table; hanya token warna, Card, Button, Badge, Alert, Dialog, Skeleton, dan responsive behavior yang direuse.
