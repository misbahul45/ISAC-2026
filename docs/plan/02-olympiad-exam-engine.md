# Olympiad Exam Engine Plan

## Scope

Exam Engine hanya berlaku ketika:

- `registration.competition.type === OLIMPIADE`;
- `exam.stage.competition_id === registration.competition_id`;
- `exam.stage_id === team.current_stage_id`;
- Exam berada pada window yang diizinkan backend;
- jumlah Attempt belum melewati `exam.max_attempts`.

Route UI tetap `/dashboard/olimpiade/{examId}`. Shell yang ada akan diisi secara bertahap; tidak dibuat dashboard per Competition.

## Lifecycle Attempt

```text
Exam metadata card
→ preflight
→ POST create/resume Attempt
→ bootstrap questions without answer key
→ fullscreen request (best effort)
→ answer autosave + heartbeat + event batch
→ submit or server auto-submit
→ server scoring
→ result according to show_result_immediately
```

### Preflight

- Sinkronkan server time; jangan memakai jam browser sebagai authority.
- Cek schedule, current Stage, registration, max attempts, dan existing unfinished Attempt.
- Cek koneksi dan storage browser hanya sebagai UX signal.
- Tampilkan consent dan jenis integrity event yang direkam.
- Fullscreen, camera, atau advanced monitoring tidak boleh diminta tanpa requirement dan consent eksplisit.

### Bootstrap

Response Team hanya memuat:

- Attempt ID, start/end server time, remaining seconds;
- question ID, order, question body, safe options, type;
- saved answer milik Attempt;
- navigation state dan autosave revision.

Response tidak memuat:

- `correct_answer`;
- explanation sebelum result diizinkan;
- scoring rubric internal;
- question inactive;
- Attempt Team lain.

## Autosave

- Endpoint answer memakai idempotency key dan `clientRevision` monotonik.
- Backend menyimpan jawaban dengan unique `(attempt_id, question_id)`.
- Server mengembalikan `serverRevision`, `savedAt`, dan canonical answer.
- Request revision lama tidak boleh menimpa revision baru.
- Client mempertahankan queue lokal sementara saat offline, lalu replay berurutan.
- Queue lokal tidak dianggap tersimpan sampai server acknowledgment diterima.

## Timer

- Deadline dihitung backend dari `start_time + duration`, dibatasi `exam.end_date`.
- Response bootstrap dan heartbeat selalu menyertakan `serverNow` dan `expiresAt`.
- UI menghitung countdown dari offset server, lalu re-sync berkala.
- Backend menolak answer setelah deadline dan melakukan auto-submit idempotent.
- Background tab throttling tidak boleh memperpanjang waktu.

## Submit

- `POST submit` memakai row lock pada Attempt.
- Jika Attempt sudah finished, return hasil canonical dan HTTP 200.
- Snapshot seluruh jawaban pada transaksi yang sama sebelum scoring.
- Score dihitung backend dari question yang terikat pada Exam saat Attempt dimulai atau dari immutable question version.
- UI tidak pernah menghitung official score.

## Question versioning requirement

Sebelum Exam production dapat dipublish, pilih salah satu desain:

1. immutable ExamQuestion setelah Attempt pertama dibuat; atau
2. `question_versions` dan `attempt_questions` snapshot.

Rekomendasi: snapshot question/order/score/options ke `attempt_questions` saat Attempt dimulai. Ini mencegah perubahan Admin mengubah ujian yang sedang berjalan.

## Recovery cases

- Refresh: bootstrap unfinished Attempt yang sama.
- Network loss: queue answer dan event; timer tetap berdasarkan deadline server.
- Duplicate submit: return canonical finished Attempt.
- Multi-device login: policy satu active device per Attempt; device kedua ditolak atau memerlukan Admin override.
- Browser crash near deadline: server scheduler/reconciliation menyelesaikan Attempt expired.
- Schedule changed after Attempt starts: Attempt menggunakan effective deadline yang tersimpan.

## Admin controls

- Open/close Exam mengikuti schedule, bukan toggle frontend.
- Emergency pause harus menyimpan reason, actor, affected attempts, dan adjusted deadline.
- Extra time diberikan per Attempt melalui audited override, bukan mengubah seluruh Exam tanpa preview.
- Manual score adjustment menyimpan before/after dan tidak mengubah raw answers.

## Minimum acceptance tests

- Cross-stage Exam UUID menghasilkan 403.
- Upcoming/ended Exam tidak dapat memulai Attempt.
- Attempt limit enforcement atomik pada dua request paralel.
- Correct answer tidak ada di bootstrap, source map, atau logs.
- Autosave retry tidak membuat duplicate answer.
- Revision lama tidak menimpa jawaban baru.
- Submit dan auto-submit bersamaan menghasilkan satu final result.
- Timer tetap benar setelah tab background dan reconnect.
