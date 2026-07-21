# Backend and Frontend Contract Plan

## Pendekatan

Aplikasi memakai Inertia untuk halaman web. Karena itu kontrak dibagi:

1. Web page GET mengembalikan Inertia page dan props.
2. Web mutation mengembalikan redirect.
3. JSON API hanya untuk kebutuhan asynchronous yang tidak cocok dengan redirect, seperti external file registration atau selector dinamis.

Login, register, verify email, forgot password, reset password, dan mutation registration tidak mengembalikan JSON.

## Konvensi naming

- Database dan request backend menggunakan snake_case.
- Inertia props boleh menggunakan camelCase jika transformer konsisten.
- TypeScript type dibuat dari kontrak yang sama dan tidak mendefinisikan enum berbeda.
- Competition code wajib canonical.
- ID seluruh domain menggunakan UUID string.
- Date response menggunakan ISO 8601 dengan timezone.

## Shared Inertia props

Backend membagikan:

- auth.principalType: TEAM, ADMIN, atau null.
- auth.team safe summary jika Team.
- auth.admin safe summary jika Admin.
- flash.success dan flash.error.
- errors dari validation bag.
- requestId untuk troubleshooting.

Frontend tidak menerima:

- password hash.
- OTP atau reset token.
- full session/token.
- internal authorization detail yang sensitif.

## Auth pages

### Register

GET /auth/register props minimal.

POST /auth/register input:

- email.
- password.
- password_confirmation.

Hasil sukses:

- Session Team terbentuk.
- Redirect /auth/verify-email.

### Login

POST /auth/login:

- email.
- password.
- remember opsional.

Hasil:

- Admin redirect /admin/dashboard.
- Team redirect canonical.

Frontend tidak menerima token JSON.

### Verify email

GET props:

- maskedEmail.
- resendAvailableAt.
- challengeExpiresAt.

POST input:

- code.

Resend tidak mengirim email input karena account berasal dari session.

### Forgot/reset

Forgot input hanya email. Response selalu redirect dengan pesan generik.

Verify reset input hanya code karena challenge reference berada dalam session.

Change password input:

- password.
- password_confirmation.

## Registration selection page

GET /registration props:

- competitions.
- tiap Competition berisi openBatches.
- currentRegistration jika ada.

Competition item:

- id.
- name.
- slug.
- type.
- description.
- paymentFlow.
- registrationStart/end.

Batch item:

- id.
- name.
- slug.
- startAt.
- endAt.
- price.
- quota.
- remainingQuota.
- status.

POST selection input:

- competition_id.
- batch_id.

Frontend tidak mengirim competition name/type sebagai source of truth.

## Team phase

GET /registration/team props:

- team current values.
- competition summary.
- revision note jika ada.

PATCH input:

- name.
- phone.
- school_name.
- school_province.
- school_city.
- school_address.

document_url dan twibbon_url tidak diterima di fase ini.

## Member phase

GET props:

- competitionType.
- minMembers.
- maxMembers.
- members existing.
- field requirements.
- revision note.

PUT input:

- members array final.

Member item:

- id opsional untuk update.
- name.
- role.
- email.
- phone.
- education_level.
- major nullable sesuai Competition.
- faculty nullable.
- student_id.
- birth_date.
- photo_file_id nullable.
- sort_order.

Backend menentukan min/max dari Competition, bukan dari value client.

## Documents phase

GET props:

- documentUrl.
- twibbonUrl.
- revision note.

PATCH input:

- document_url.
- twibbon_url.

Sukses:

- Olympiad redirect Payment.
- Competition lain redirect Waiting Verification.

## File registration JSON API

External upload membutuhkan endpoint:

- GET /api/uploads/provider-auth.
- POST /api/files.

Keduanya authenticated dan authorized untuk Team atau Admin sesuai collection/purpose.

POST /api/files:

- fileId.
- url.
- purpose.

Response JSON:

- id.
- fileId.
- url.

Backend sebaiknya memvalidasi host provider dan purpose agar arbitrary URL tidak dicatat sebagai bukti pembayaran.

## Payment phase

GET props:

- registrationId.
- amount.
- paymentMethods.
- paymentInstructions.
- qrImageUrl jika tersedia.
- paymentStatus.
- existingProof.
- rejectionReason.
- paymentForStage.

POST/PATCH input:

- payment_proof_file_id.
- payment_method.
- transaction_id opsional.

Frontend tidak mengirim amount_paid, verified status, verified actor, atau destination Stage.

Promo tidak dimasukkan sampai terdapat tabel, rule, dan endpoint promo resmi. UI promo mock dihapus atau disembunyikan.

## Waiting and rejected pages

Waiting props:

- teamStatus.
- paymentStatus.
- submittedAt.
- human-readable summary.

Revision props:

- revisionStep.
- verificationNote.
- paymentRejectionReason.

Frontend boleh menampilkan status, tetapi tidak menentukan redirect dari status. Backend sudah memilih halaman sebelum render.

## Dashboard Team

GET /dashboard props:

- team safe summary.
- competition.
- batch.
- currentStage.
- module.
- availableActions.

availableActions dihitung backend:

- canSubmit.
- canStartExam.
- paymentRequired.
- canViewFeedback.

Authorization tetap dilakukan backend walaupun button disembunyikan.

## Admin contracts

Admin list memakai server-side pagination dan filter query.

Mutation CRUD dan verification memakai Inertia redirect:

- Sukses membawa flash.
- Validation error kembali ke form.
- Conflict status kembali dengan domain error.

Jika data table memerlukan asynchronous fetch, endpoint JSON terpisah dapat ditambahkan tetapi memakai Policy yang sama.

## Frontend state

Yang boleh disimpan lokal:

- Pure UI state seperti active card, animation, dan unsaved draft singkat.
- Draft localStorage opsional dengan key menyertakan Team ID dan schema version.

Yang tidak boleh menjadi source of truth:

- Selected Competition.
- Selected Batch.
- Current registration phase.
- Team/Registration status.
- Member final state setelah submit.
- Payment verification.
- Current Stage.
- Authentication token.

Setelah setiap GET, props backend menggantikan draft yang sudah sukses disimpan.

## Form behavior

- React Hook Form dan Zod tetap dipakai untuk UX.
- Backend FormRequest tetap validasi authoritative.
- Frontend schema harus mengikuti field DB/API.
- Inertia router mutation menangani processing, errors, preserveScroll bila perlu.
- Hilangkan setTimeout simulasi dan console.log data sensitif.
- Disable submit saat processing, tetapi backend tetap idempotent.

## Error mapping

- Validation errors dipetakan per field.
- Domain conflict ditampilkan sebagai form-level error.
- 403 menampilkan unauthorized.
- 404 menampilkan not found.
- 419 mengarahkan refresh/session expired.
- Rate limit menampilkan retry countdown dari backend.
- 500 menampilkan request ID tanpa stack trace.

## Compatibility

Selama transisi:

1. Tambahkan transformer baru tanpa langsung menghapus seluruh prop lama.
2. Pindahkan satu halaman pada satu waktu dari mock/localStorage ke DB.
3. Tandai contract lama deprecated.
4. Hapus API auth bearer lama setelah seluruh Inertia auth memakai session dan tidak ada consumer lain.
5. Update koleksi API documentation hanya untuk endpoint JSON yang tetap ada.

## Test contract

- Feature test memeriksa Inertia component dan props.
- Feature test memeriksa redirect setiap mutation.
- Typecheck memastikan type frontend cocok.
- Browser test menyelesaikan ketiga flow Competition.
- Browser test refresh pada setiap fase dan memastikan resume dari DB.
- Browser test direct URL memastikan canonical redirect.
- Browser test session expired dan rate-limited auth.

