# Team Registration Flow Plan

## Sasaran

Registration Team adalah wizard server-driven. Setiap GET mendapatkan data dari DB melalui Inertia props. Setiap mutation menyimpan data dan menerima redirect backend. Frontend tidak menyimpan progress utama di localStorage.

## Prasyarat

- User authenticated sebagai Team.
- Team.email_verified_at sudah terisi.
- Team belum memiliki Registration lain.
- Competition dan Batch yang dipilih masih menerima pendaftaran.

## Fase 0: Account dan email

Register hanya membuat akun minimal:

- email.
- password.
- code.
- status INCOMPLETE.

Setelah OTP benar, backend mengisi email_verified_at dan mengarahkan Team ke pemilihan Competition.

## Fase 1: Competition dan Batch

Halaman /registration menampilkan:

- Competition dengan status REGISTRATION_OPEN.
- Batch OPEN milik setiap Competition.
- Periode Batch.
- Harga Batch.
- Kuota tersisa.
- Penjelasan payment flow.

Mutation:

- POST /registration/selection.

Input:

- competition_id.
- batch_id.

Backend:

1. Lock row Batch.
2. Validasi Batch milik Competition.
3. Validasi Competition dan Batch masih open.
4. Validasi tanggal dan kuota.
5. Pastikan Team belum memiliki Registration.
6. Buat Registration.
7. Naikkan cached current_registrations jika field dipertahankan.
8. Redirect /registration/team.

Status awal:

- OLIMPIADE menjadi WAITING_PAYMENT.
- BUSINESS_PLAN dan BUSINESS_IT_CASE menjadi VERIFIED oleh sistem.

Setelah Registration dibuat, Team tidak dapat mengganti Competition atau Batch sendiri. Perubahan hanya melalui Admin dengan audit dan pengecekan kuota.

## Fase 2: Team

Halaman /registration/team mengisi:

- name.
- phone.
- school_name.
- school_province.
- school_city.
- school_address.

Tidak ada document URL, twibbon URL, payment, atau competition_type pada payload. Competition dibaca melalui Registration.

Mutation:

- PATCH /registration/team.

Backend:

1. Ambil Team dari guard.
2. Pastikan canonical step adalah TEAM atau revisi TEAM.
3. Validasi field.
4. Validasi jenis institusi berdasarkan Competition.
5. Update Team.
6. Isi Registration.team_completed_at.
7. Jika resubmit revisi TEAM, bersihkan revision_step dan ubah Team.status kembali WAITING_VERIFICATION setelah registration sudah submitted.
8. Redirect /registration/biodata.

## Fase 3: Member

Halaman /registration/biodata mengambil Member existing dari backend.

Jumlah:

- OLIMPIADE tepat satu.
- BUSINESS_PLAN dua atau tiga.
- BUSINESS_IT_CASE dua atau tiga.

Role:

- Tepat satu LEADER.
- Sisanya MEMBER.

Mutation:

- PUT /registration/members.

Payload berisi seluruh daftar final Member, bukan satu request terpisah tanpa finalisasi.

Backend dalam transaction:

1. Pastikan fase Team selesai.
2. Validasi jumlah berdasarkan Competition.
3. Validasi tepat satu LEADER.
4. Validasi email dan student identity.
5. Upsert Member milik Team.
6. Soft delete Member lama yang tidak lagi ada jika registration belum terkunci.
7. Normalisasi sort_order.
8. Isi members_completed_at.
9. Tangani resubmit revisi MEMBERS.
10. Redirect /registration/documents.

Setelah submitted_at terisi, perubahan Member hanya diizinkan ketika Team.status REVISION_REQUIRED dengan revision_step MEMBERS atau Admin membuka kembali fase tersebut.

## Fase 4: Documents

Halaman /registration/documents mengisi:

- document_url.
- twibbon_url.

Keduanya wajib Google Drive dan harus menggunakan HTTPS.

Mutation:

- PATCH /registration/documents.

Backend:

1. Pastikan Team dan Member selesai.
2. Validasi URL.
3. Update Team.
4. Isi documents_completed_at.
5. Jika Competition OLIMPIADE, redirect /registration/payment.
6. Jika Competition lain, finalisasi Registration tanpa halaman pembayaran.

Finalisasi non-Olympiad:

- Registration.status tetap VERIFIED.
- Registration.submitted_at diisi.
- Team.status menjadi WAITING_VERIFICATION.
- revision metadata dibersihkan.
- Redirect /registration/waiting-verification.

## Fase 5: Payment Olympiad

Halaman /registration/payment hanya tersedia apabila:

- Competition OLIMPIADE saat pembayaran awal; atau
- Business Plan/BIT sedang memiliki payment gate menuju Stage berikutnya.

Inertia props:

- amount dari Batch.
- payment instructions.
- payment methods.
- payment status.
- payment rejection reason.
- existing proof metadata jika ada.

File upload:

1. Frontend meminta provider upload signature dari endpoint authenticated.
2. File diunggah ke provider.
3. Metadata didaftarkan ke files.
4. Frontend menerima files.id.
5. Payment form mengirim payment_proof_file_id.

Mutation:

- POST /registration/payment untuk pertama kali.
- PATCH /registration/payment untuk revisi.

Payload:

- payment_proof_file_id.
- payment_method.
- transaction_id opsional.

Backend:

1. Pastikan payment gate aktif.
2. Pastikan File record ada.
3. Ambil harga dari Batch; abaikan nominal client.
4. Set amount_paid.
5. Set payment_submitted_at.
6. Set status WAITING_VERIFICATION.
7. Bersihkan payment_rejection_reason.
8. Untuk initial Olympiad, isi submitted_at dan ubah Team.status menjadi WAITING_VERIFICATION.
9. Redirect waiting-verification.

## Team verification

Admin memeriksa:

- Data Team.
- Seluruh Member.
- Dokumen dan twibbon.

Transisi:

- WAITING_VERIFICATION ke VERIFIED.
- WAITING_VERIFICATION ke REVISION_REQUIRED.
- WAITING_VERIFICATION ke REJECTED.
- REVISION_REQUIRED ke WAITING_VERIFICATION setelah Team resubmit.

Revision wajib memiliki revision_step dan verification_note.

## Payment verification

Admin memeriksa payment proof.

Transisi:

- WAITING_VERIFICATION ke VERIFIED.
- WAITING_VERIFICATION ke REVISION_REQUIRED.
- WAITING_VERIFICATION ke REJECTED.
- REVISION_REQUIRED ke WAITING_VERIFICATION setelah Team upload ulang.

Admin tidak boleh memverifikasi payment tanpa proof kecuali status VERIFIED memang dibuat otomatis oleh sistem untuk non-Olympiad initial flow.

## Activation

Setiap verifikasi Team atau Registration memanggil activation service.

Initial activation terjadi jika:

- submitted_at terisi.
- Team.status VERIFIED.
- Registration.status VERIFIED.
- current_stage_id masih null.

Service memilih Stage ber-order paling awal pada Competition terkait.

## Flow OLIMPIADE

1. Register dan verify email.
2. Pilih OLIMPIADE dan Batch.
3. Registration WAITING_PAYMENT.
4. Lengkapi Team.
5. Buat satu Member LEADER.
6. Isi document dan twibbon.
7. Upload payment.
8. Registration WAITING_VERIFICATION.
9. Team WAITING_VERIFICATION.
10. Admin verifikasi data dan payment.
11. Keduanya VERIFIED.
12. Backend mengisi Stage awal.
13. Redirect dashboard/Exam sesuai Stage.

## Flow Business Plan dan Business IT Case

1. Register dan verify email.
2. Pilih Competition dan Batch.
3. Registration langsung VERIFIED untuk payment gate.
4. Lengkapi Team.
5. Buat dua atau tiga Member.
6. Isi document dan twibbon.
7. Tidak ada UI payment.
8. Registration.submitted_at diisi.
9. Team WAITING_VERIFICATION.
10. Admin verifikasi data.
11. Team VERIFIED.
12. Backend mengisi Stage awal.
13. Team mengikuti Submission.

## Payment Semifinal

Saat Admin menyatakan Team lolos:

1. Jangan langsung pindahkan current_stage_id.
2. Set Registration.status WAITING_PAYMENT.
3. Isi payment_required_at dan payment_for_stage_id.
4. Resolver mengarahkan Team ke payment.
5. Team upload proof.
6. Admin verifikasi.
7. Setelah VERIFIED, pindahkan current_stage_id ke Stage tujuan.

## Revision behavior

Data revision:

- revision_step TEAM menuju /registration/team.
- revision_step MEMBERS menuju /registration/biodata.
- revision_step DOCUMENTS menuju /registration/documents.

Payment revision selalu menuju /registration/payment.

Ketika fase lama diedit sebelum submission, completion marker downstream dapat dikosongkan bila perubahan memengaruhi validitas downstream. Contoh perubahan Competition oleh Admin harus mengosongkan Member dan Documents completion.

## Cancellation

Registration dapat CANCELLED oleh Admin atau Team hanya sebelum submitted, sesuai policy.

Cancellation:

- Mengurangi cached Batch registration count dalam transaction.
- Tidak menghapus Team account.
- Mencegah akses wizard lama.
- Re-registration hanya diizinkan melalui rule eksplisit, bukan otomatis.

## Concurrency dan idempotency

- Selection memakai transaction dan lock Batch.
- Finalisasi Member memakai satu transaction.
- Submit payment mencegah duplikasi request.
- Admin verify bersifat idempotent.
- Activation Stage bersifat idempotent.
- Double click frontend tidak membuat Registration, Member, atau payment submission ganda.

## Data UI existing yang harus diganti

- Competition constant diganti Inertia props DB.
- selected_competition query tidak dipakai sebagai source of truth.
- Hard-coded BUSINESS_IT_CASE dihapus.
- Member tidak lagi selalu tiga.
- localStorage bukan persistence utama.
- Simulasi setTimeout diganti mutation nyata.
- Payment mock TeamAccount dihapus.
- Harga Rp50.000 dan QR statis diganti data backend.
- Non-Olympiad melewati halaman payment awal.

