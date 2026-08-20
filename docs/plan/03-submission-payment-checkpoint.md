# Submission dan Payment Checkpoint Plan

## Satu engine untuk dua Competition

`BUSINESS_PLAN` dan `BUSINESS_IT_CASE` memakai route dan component yang sama:

```text
/dashboard/submission/{stageId}
```

Perbedaan konten berasal dari Competition, Stage, Batch module, dan policy backend; bukan dari duplikasi route.

## Authorization

Stage dapat dibuka jika seluruh kondisi terpenuhi:

- `stage.competition_id === registration.competition_id`;
- Stage adalah `team.current_stage_id`, atau Stage adalah `registration.payment_for_stage_id`;
- Competition type adalah Business Plan atau Business IT Case;
- submission mutation hanya dibuka jika Stage sudah menjadi current Stage;
- payment target yang belum verified tetap locked.

## Submission lifecycle

```text
No record
→ draft
→ submitted
→ under_review
→ approved

under_review
→ revision_requested
→ draft/re-submitted

under_review
→ rejected
```

Schema existing sudah mempunyai unique `(team_id, stage_id)`. Mutation update harus mempertahankan record yang sama; replacement file tidak membuat Submission kedua.

## File flow

- Upload melalui infrastructure File existing dengan purpose `SUBMISSION`.
- Backend memeriksa file uploader adalah Team aktif.
- File purpose tidak dapat dipakai lintas domain.
- Validate MIME, extension, size, checksum, dan malware scan sesuai provider yang tersedia.
- File lama dipertahankan sampai replacement berhasil dan audit/revision history tercatat.
- Download menggunakan endpoint terotorisasi; URL provider tidak menjadi authority.

## Batch module/case

Module selalu diambil dari:

```text
registration.batch.module_file_id
```

Jangan membuat module per Team. Backend hanya mengizinkan Team mengunduh module dari Batch Registration miliknya.

## Payment checkpoint Semifinal

Saat Admin memilih Team lolos:

```text
registration.status = WAITING_PAYMENT
registration.payment_required_at = now()
registration.payment_for_stage_id = semifinalStage.id
team.current_stage_id tetap Stage sebelumnya
```

Submission page menampilkan:

- nama target Stage;
- nama Batch Registration;
- original amount dari `registration.batch.price`;
- state payment;
- rejection reason bila ada.

Promo quote tetap melalui backend. Jangan menghitung diskon atau mengambil active/latest Batch di frontend.

### Payment state

- `WAITING_PAYMENT`: tampil upload checkpoint, Submission locked.
- `WAITING_VERIFICATION` + submitted: tampil review state, locked.
- `REVISION_REQUIRED`: tampil correction state + reason, locked.
- Admin verify: `current_stage_id` dipindahkan ke target, target cleared, Submission unlocked.

## Receipt dan proof download

Fondasi dashboard saat ini dapat mengunduh file proof existing. File model belum menyimpan MIME/original filename, sehingga UI tidak boleh selalu menyebut file itu PDF.

Untuk receipt PDF resmi, rencanakan endpoint terpisah setelah payment verified:

```text
GET /api/registrations/{registration}/payment-receipt.pdf
```

Receipt berisi snapshot faktual:

- receipt number deterministic;
- Team code/name;
- Competition dan Batch;
- `originalAmount` dari Batch Registration;
- promo/discount dan amount paid yang tersimpan;
- payment method, submittedAt, verifiedAt;
- verifier identity yang aman ditampilkan;
- verification status.

Receipt tidak menghitung ulang harga pada waktu download. Bila historical immutability diwajibkan, tambah snapshot requirement melalui migration tersendiri sebelum fitur receipt dirilis.

Dashboard menampilkan success notice satu kali setelah `verifiedAt` tersedia. Dismissal hanya presentation state; link receipt/proof tetap persisten.

## Submission acceptance tests

- Stage Competition lain menghasilkan 403.
- Target payment Stage dapat dilihat tetapi mutation Submission ditolak.
- Harga checkpoint berbeda sesuai Batch Registration tiap Team.
- Upload dengan File Team lain atau purpose lain ditolak.
- Retry create/update tidak membuat record kedua.
- Submission setelah deadline ditolak backend.
- Revision mempertahankan history file dan feedback.
- Receipt hanya tersedia untuk verified payment milik Team atau Admin berizin.
