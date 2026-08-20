# Testing, Delivery, dan Operations

## Test pyramid

### Unit

- Batch price formatter dan availability presentation.
- Exam time state derivation.
- payment checkpoint state mapping.
- rule engine evidence and score aggregation.
- question validation/scoring.
- idempotency key resolver.

### Feature/API

- Registration per Competition/Batch/payment flow.
- Dashboard summary and shell authorization.
- Attempt lifecycle, autosave revision, deadline, submit.
- Submission lifecycle and file ownership.
- Admin policies and audit logs.
- Bulk preview/execute/idempotency.
- Announcement audience snapshot.
- Receipt authorization and verified-only rule.
- Integrity event dedupe, limits, and review.

### Browser/E2E

- Mobile and desktop dashboard.
- Olimpiade card to Exam shell/engine.
- Business card current/payment target Stage.
- Payment status before/after verification and one-time dismiss.
- Receipt/proof download remains after dismiss.
- Refresh/offline/reconnect during Exam.
- Keyboard-only Exam navigation and reduced motion.
- Admin question editor and bulk confirmation.

### Load

- simultaneous Attempt start at Exam opening;
- autosave and heartbeat steady state;
- event replay after short outage;
- submit spike at deadline;
- announcement fan-out;
- bulk advancement by Competition.

## Mandatory security tests

- IDOR across Team, Competition, Stage, Exam, Attempt, Submission, File, receipt.
- Admin role privilege separation.
- Answer key leakage in Team API/log/cache/source maps.
- File purpose and uploader spoofing.
- Rate limit and payload limits.
- Stored XSS through question/submission/announcement content.
- Replay/idempotency race.
- CSRF/session behavior according to Sanctum mode.
- Receipt/proof cache and URL exposure.

## Seeder verification

Fresh development database must contain:

- 3 Competition;
- 2 Batch per Competition, 6 total;
- exact Batch price matrix;
- official dates without timezone shift;
- Stage progression per timeline plan;
- safe Olimpiade Exam metadata only;
- no Team, payment, Submission, question, Attempt, answer, score, or event log from timeline seeder.

Run seed twice and compare counts/natural keys.

## Deployment sequence

1. Backward-compatible migration.
2. Backend read contracts.
3. Backend mutation behind feature flag.
4. Admin content tooling.
5. Team UI shell/engine.
6. Integrity ingestion shadow mode.
7. Rule engine review-only mode.
8. Production enablement per Competition/Stage.

Never deploy a Team UI that calls a mutation before backend authorization/idempotency is live.

## Feature flags

Suggested server-side flags:

- `exam_engine_enabled` per Exam;
- `submission_enabled` per Stage;
- `integrity_collection_enabled` per Exam;
- `integrity_rule_enforcement` default review-only;
- `receipt_pdf_enabled`;
- `bulk_advancement_enabled`.

Flags are operational controls, not replacements for authorization.

## Observability

Metrics:

- dashboard and shell error/latency;
- active Attempts;
- autosave success/error/retry latency;
- heartbeat lag and disconnected count;
- event ingestion accepted/duplicate/rejected;
- submit success/auto-submit count;
- queue depth and dead jobs;
- Submission upload/submit errors;
- payment checkpoint counts by state/Batch;
- bulk job success/failure/skipped;
- announcement delivery/read rates.

Logs use request ID, actor ID, Attempt/Submission/job ID, and error code. Jangan log answer body, correct answer, auth token, receipt token, atau file provider secret.

## Alerts

- elevated API 5xx/403 anomaly;
- autosave error rate above threshold;
- heartbeat gap across many Attempts;
- event queue backlog;
- submit jobs not completing after deadline;
- payment verification transition mismatch;
- bulk job partial failure;
- mail provider outage.

## Backup and recovery

- Database backup before event-day schema/content change.
- Point-in-time recovery capability tested.
- Attempt answer and event tables included.
- File provider references reconciled.
- Recovery drill validates unfinished Attempt resume and deadline policy.
- Manual Admin override requires reason and audit.

## Event-day runbook

Sebelum buka:

- verify server clock/timezone;
- verify Exam schedule and published question count;
- run Team authorization smoke test;
- check queue, cache, mail, file provider, and database health;
- freeze question edits or enable version snapshot;
- confirm on-call roles and escalation channel.

Saat berlangsung:

- monitor active Attempt/autosave/heartbeat/queue;
- communicate incident status through dashboard announcement;
- pause/extend only via audited operation;
- avoid direct database edits.

Setelah selesai:

- reconcile unfinished/expired Attempts;
- snapshot result and integrity rule version;
- review flags before qualification;
- export audit report;
- retain evidence according to policy.

## Release gates

- `npm run typecheck` and production build pass.
- PHP lint/Pint pass.
- Feature tests pass with PDO-enabled test runtime.
- E2E critical paths pass in supported browsers.
- Security checklist signed.
- Load target and submit spike pass.
- Rollback and recovery path documented and rehearsed.
