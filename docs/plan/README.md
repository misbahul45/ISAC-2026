# ISAC 2026 Delivery Plan

Dokumen pada folder ini adalah planning aktif setelah fondasi unified Team Dashboard, Batch pricing, activity routing, dan timeline seed tersedia. Planning lama di `docs/plans` telah ditutup dan dihapus agar status pekerjaan tidak bercampur.

## Prinsip yang tidak boleh berubah

- Team hanya memiliki satu dashboard: `/dashboard`.
- Harga dasar selalu `registration.batch.price`.
- Waktu pembayaran selalu mengikuti `registration.competition.payment_flow`.
- `OLIMPIADE` memakai `UPFRONT`; `BUSINESS_PLAN` dan `BUSINESS_IT_CASE` memakai `SEMIFINAL`.
- Team hanya mengakses Exam milik `team.currentStage`.
- Business activity memakai `currentStage`, atau `paymentForStage` saat payment checkpoint aktif.
- Dashboard tidak pernah mengirim question, correct answer, atau explanation.
- UUID dari URL selalu diperiksa lagi terhadap Registration, Competition, Stage, dan Team di backend.
- Semua mutation penting bersifat idempotent, diaudit, dan tetap diotorisasi backend.

## Status fondasi saat dokumen dibuat

Sudah tersedia:

- unified `/dashboard` dengan activity card per Competition;
- `GET /api/dashboard/summary` dengan Competition, Batch, Batch price, current Stage, payment target, dan current-stage Exam metadata;
- shell terotorisasi `GET /api/dashboard/exams/{exam}` dan `GET /api/dashboard/stages/{stage}`;
- route UI `/dashboard/olimpiade/{examId}` dan `/dashboard/submission/{stageId}`;
- pemilihan Competition dan Batch actual pada registrasi;
- quote payment terhadap `registration.batch.price`;
- official timeline seeder ISAC 2026;
- admin correction untuk Team, member, Competition, dan Batch dari pekerjaan sebelumnya.

Belum tersedia dan direncanakan di dokumen ini:

- Exam Engine dan scoring;
- Submission uploader dan review;
- payment checkpoint uploader di halaman Stage;
- receipt PDF terverifikasi;
- Admin Stage, Exam, dan question management;
- bulk Team advancement dan announcement;
- anti-cheat collection, detection, dan integrity review.

## Indeks dokumen

1. [Domain dan roadmap](./01-domain-and-roadmap.md)
2. [Olympiad Exam Engine](./02-olympiad-exam-engine.md)
3. [Submission dan payment checkpoint](./03-submission-payment-checkpoint.md)
4. [Admin content management](./04-admin-content-management.md)
5. [Bulk advancement dan announcement](./05-bulk-advancement-announcements.md)
6. [API contracts](./06-api-contracts.md)
7. [Anti-cheat dan exam integrity](./07-anti-cheat-integrity.md)
8. [Testing, delivery, dan operations](./08-testing-delivery-operations.md)

## Urutan implementasi

1. Stabilkan kontrak dashboard dan authorization tests.
2. Bangun Admin Stage, Exam, dan question management.
3. Bangun Team Exam bootstrap, attempt lifecycle, autosave, dan submit.
4. Tambahkan integrity event ingestion sebelum ujian production dibuka.
5. Bangun Submission lifecycle dan payment checkpoint.
6. Bangun bulk advancement, announcement, dan job observability.
7. Tambahkan receipt PDF terverifikasi.
8. Jalankan security review, load test, recovery drill, dan event-day rehearsal.
