# Anti-Cheat dan Exam Integrity Plan

## Tujuan dan batasan

Browser anti-cheat tidak dapat membuktikan bahwa peserta tidak memakai perangkat kedua, tidak dapat mendeteksi screenshot OS secara andal, dan deteksi devtools memiliki false positive. Sistem harus menghasilkan evidence untuk review, bukan otomatis mendiskualifikasi berdasarkan satu signal.

Prinsip:

- transparan kepada peserta;
- collect minimum data;
- server-authoritative;
- false-positive aware;
- human review untuk tindakan berat;
- retention dan access control jelas.

## Existing schema foundation

`exam_attempts` sudah memiliki:

- flagged, cheatCount, suspiciousScore;
- deviceId, IP address, user agent, metadata;
- start/end/finished.

`exam_event_logs` sudah memiliki event type:

- started, question viewed/answered/changed;
- tab switched, window blurred/focused;
- copy/paste/right-click attempted;
- devtools opened, screenshot attempted;
- fullscreen exited;
- time warning/expired;
- submitted/auto-submitted;
- disconnected/reconnected;
- suspicious activity.

Schema belum mempunyai event UUID, sequence, occurredAtClient, receivedAt, rule version, atau integrity decision history. Tambahkan melalui migration sebelum ingestion production.

## Event envelope

Client mengirim batch kecil:

```json
{
  "attemptSessionId": "opaque-session-id",
  "events": [
    {
      "eventId": "uuid",
      "sequence": 42,
      "type": "tab_switched",
      "occurredAtClient": "2026-10-10T03:20:10.120Z",
      "monotonicMs": 321244,
      "metadata": {
        "hiddenDurationMs": 2400
      }
    }
  ]
}
```

Backend menambahkan Attempt ID dari route, receivedAt server, IP/user-agent snapshot, request ID, dan validation result. Client tidak boleh mengirim Team ID atau score.

## Required schema changes

### exam_event_logs

- `event_id` UUID/string, unique per Attempt;
- `sequence` bigint, indexed per Attempt;
- `occurred_at_client` nullable datetime;
- `received_at` server datetime;
- `monotonic_ms` nullable bigint;
- `rule_version` nullable string;
- metadata size limit.

Unique `(attempt_id, event_id)` membuat replay aman. Sequence gap menjadi signal kualitas, bukan automatic cheat.

### exam_attempt_integrity_reviews

- attemptId;
- system score/risk level/rule version;
- decision: pending, cleared, confirmed, escalated;
- reviewer/reason/reviewedAt;
- before/after snapshot.

Jangan menimpa raw events saat review.

## Collection rules

- Event batch maksimum dan payload byte limit.
- Allowlist metadata per event type; reject arbitrary object depth.
- Timestamp client hanya evidence tambahan; ordering authority memakai sequence + receivedAt.
- Event `screenshot_attempted` hanya dikirim bila browser API benar-benar memberi signal; jangan mengklaim deteksi universal.
- Devtools heuristic dinonaktifkan bila tidak cukup andal atau menimbulkan accessibility issue.
- Clipboard/context-menu prevention adalah friction, bukan security boundary.
- No keystroke content logging, no clipboard content, no camera/microphone by default.
- IP disimpan sesuai privacy policy; untuk analytics dapat digunakan hash/prefix, sedangkan security access dibatasi.

## Heartbeat

Heartbeat setiap interval wajar, misalnya 15–30 detik dengan jitter:

- attempt/session ID dari auth context;
- last event sequence acknowledged;
- last answer revision;
- visibility/fullscreen state;
- connection state.

Response:

- serverNow/expiresAt/remainingSeconds;
- latest acknowledged sequences;
- `mustSubmit` bila deadline lewat;
- session conflict state;
- next heartbeat interval.

Tidak ada event per mouse movement karena noise, privacy, dan load.

## Initial rule engine

Rule-based engine lebih dapat diaudit daripada ML pada data awal. Contoh signal, bukan angka final:

- repeated tab hidden dengan durasi signifikan;
- fullscreen exit berulang setelah warning;
- prolonged disconnect mendekati answer burst;
- impossible event sequence/replay anomalies;
- simultaneous active session/device;
- answer mutation setelah deadline attempt;
- high-frequency copy/paste/context menu attempts;
- heartbeat missing saat browser tetap mengirim answer;
- device ID berubah dalam Attempt.

Setiap rule menghasilkan evidence:

```json
{
  "rule": "TAB_HIDDEN_REPEATED",
  "version": "2026.1",
  "points": 20,
  "eventIds": ["..."],
  "explanation": "3 hidden intervals over configured threshold"
}
```

Threshold disimpan dalam versioned server config. Score dapat memicu `flagged=true`, tetapi keputusan diskualifikasi tetap manual kecuali policy resmi menyatakan lain.

## Session binding

- Attempt start menghasilkan opaque session token terikat pada Attempt, Team, dan device ID.
- Token pendek umur, rotatable, dan tidak disimpan dalam URL.
- One active session policy memakai database/cache lock.
- IP change sendiri bukan cheat; mobile/network provider dapat berubah.
- Device change memicu re-auth atau Admin override, bukan automatic failure.
- Multi-tab dapat dideteksi dengan BroadcastChannel/localStorage lease sebagai UX, lalu divalidasi heartbeat server.

## Offline and replay

- Client menyimpan unsent events dengan eventId/sequence.
- Replay diterima idempotently.
- Backend mengembalikan accepted, duplicate, rejected per event.
- Queue memiliki size cap dan drops counter; dropped count dilaporkan sebagai telemetry.
- Event ingestion failure tidak boleh menghapus jawaban yang sudah valid.

## Admin integrity UI

Attempt detail menampilkan:

- risk badge dan score;
- timeline event dalam server/client time;
- grouped rule evidence;
- disconnect/fullscreen/tab summaries;
- answer save timeline korelasi;
- device/session changes;
- raw metadata yang sudah disanitasi;
- decision form dengan reason wajib.

UI harus menghindari label “curang” sebelum review. Gunakan “flagged”, “perlu ditinjau”, atau “integrity signal”.

## Privacy and retention

- Informasikan event types sebelum Attempt dimulai.
- Retention raw events ditetapkan product/legal; contoh 90 hari setelah hasil final, bukan keputusan otomatis.
- Admin access ke integrity detail diaudit.
- Export integrity report menyensor token, full IP bila tidak perlu, dan PII member.
- Data deletion mengikuti policy sengketa hasil dan audit retention.

## Security and abuse controls

- Rate limit per Attempt+Team+IP, tetapi beri headroom batch replay.
- Validate Attempt ownership dan unfinished state pada setiap event.
- Metadata tidak dirender sebagai HTML.
- Payload decompression/JSON depth dibatasi.
- Queue consumer idempotent.
- Rule recomputation versioned dan tidak mengubah raw evidence.
- Integrity endpoints `no-store` dan tidak terindeks.

## Test matrix

- duplicate event batch;
- out-of-order batch dan sequence gap;
- malformed/oversized metadata;
- event untuk Attempt Team lain;
- event setelah submit/deadline;
- disconnect/reconnect replay;
- two active devices;
- background throttling;
- accessibility tool/fullscreen unavailable;
- false positive review clear;
- rule config version migration;
- ingestion load at peak concurrent participants.
