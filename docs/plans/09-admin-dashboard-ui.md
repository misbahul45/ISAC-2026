# Admin Dashboard UI Plan

## Tujuan dan keputusan canonical

Admin Panel menjadi pusat operasional ISAC 2026 untuk meninjau Team, mengelola Competition dan Batch, serta menyiapkan ruang bagi payment verification, Stage advancement, audit, dan judging. Route canonical adalah `/admin/dashboard`; seluruh halaman menggunakan bahasa Indonesia dan tidak memakai public Header/Footer.

Implementasi UI hanya mengaktifkan data yang benar-benar tersedia pada API. Fitur tanpa endpoint read-only tetap terlihat sebagai placeholder berlabel `Segera hadir`, tidak memakai mock data, dan tidak mengirim request palsu.

## Layout

- Desktop `lg`: sidebar fixed kiri selebar 272px dan dapat diperkecil menjadi 80px. Preferensi disimpan pada `localStorage` dengan key `isac-admin-sidebar`.
- Mobile/tablet: sidebar menjadi drawer kiri dan tertutup setelah navigasi.
- Konten kanan mempunyai sticky topbar berisi breadcrumb, judul aktif, mobile menu, dan identitas Admin.
- Sidebar memuat logo `/logo.png`, navigation, nama/role Admin, dan logout confirmation.
- Warna, radius, typography, card transparency, dan accent mengikuti token visual aplikasi: background navy, primary ungu, secondary cyan, accent lime.
- Table desktop mempunyai mobile card counterpart. Semua halaman menyediakan loading, empty, error, retry, dan mutation pending state.

## Route dan status aktivasi

| Route | Modul | Status | Sumber data |
|---|---|---|---|
| `/admin/dashboard` | Ringkasan | Shell aktif, agregat placeholder | Menunggu Admin summary API |
| `/admin/teams` | Daftar Team | Aktif | `GET /api/admin/teams` |
| `/admin/teams/{team}` | Detail dan review Team | Aktif | Detail + verify/revision/reject API |
| `/admin/competitions` | Competition | Aktif | Competition list + Admin CUD API |
| `/admin/batches` | Batch | Aktif | Admin Batch CRUD API |
| `/admin/payments` | Payment queue | Placeholder | Menunggu list/detail proof API |
| `/admin/stages` | Stage management | Placeholder | Menunggu daftar next-stage API |
| `/admin/audit-logs` | Audit | Placeholder | Menunggu read-only audit API |
| `/admin/judging` | Penilaian | Placeholder | Menunggu assignment/rubric API |

## Authorization dan navigation

| Modul | super_admin | admin_registration | admin_payment | judge |
|---|---:|---:|---:|---:|
| Dashboard | Ya | Ya | Ya | Ya |
| View Team | Ya | Ya | Ya | Tidak |
| Review Team | Ya | Ya | Tidak | Tidak |
| Payment placeholder | Ya | Tidak | Ya | Tidak |
| Competition view | Ya | Ya | Ya | Ya |
| Competition mutation | Ya | Tidak | Tidak | Tidak |
| Batch view | Ya | Ya | Ya | Ya |
| Batch mutation | Ya | Ya | Tidak | Tidak |
| Stage placeholder | Ya | Ya | Tidak | Tidak |
| Audit placeholder | Ya | Tidak | Tidak | Tidak |
| Judging placeholder | Ya | Tidak | Tidak | Ya |

Frontend menyembunyikan navigation/action yang tidak dimiliki role. Policy backend tetap menjadi enforcement utama dan response 401/403 tetap ditangani sebagai error state.

## Modul aktif

### Team

- Filter list hanya memakai kontrak yang tersedia: `status`, `competition_id`, `batch_id`, `page`, dan `per_page`.
- Table/card menampilkan kode, nama, institusi, Competition, Batch, Team status, Registration status, submitted time, dan link detail.
- Detail memuat profil, alamat JSON yang sudah diformat, peserta, dokumen, registration progress, note, dan status.
- Verify hanya tersedia pada `WAITING_VERIFICATION`.
- Revision mewajibkan `revision_step` (`TEAM`, `MEMBERS`, atau `DOCUMENTS`) dan `verification_note`.
- Reject mewajibkan `reason`. Semua mutation mengirim `X-Request-ID`, menampilkan confirmation/loading/toast, lalu invalidasi list dan detail.
- Payment proof dan Stage action tidak ditampilkan sampai data discovery API tersedia.

### Competition

- Search, type, status, dan pagination mengikuti `GET /api/competitions`.
- Create/edit/delete hanya tampil untuk Super Admin.
- Form memuat nama, slug, deskripsi, tipe, payment flow, tanggal mulai/selesai, dan status.
- Validation error API dipetakan ke field dan dibersihkan saat field berubah.

### Batch

- Filter Competition dikirim ke API; filter status dilakukan pada collection lengkap hasil endpoint Batch.
- Tabel/card memuat Competition, periode, harga, kuota, current registrations, remaining quota, dan status.
- Create/edit/delete tersedia bagi Super Admin dan Admin Registration.
- Competition tidak dapat diubah saat edit karena kontrak update Batch tidak menerima `competition_id`.

## Summary Team versus Admin

`GET /api/dashboard/summary` adalah resource Team tunggal dan tidak boleh dipakai Admin. Admin membutuhkan agregat lintas Team yang akurat dan role-aware. Endpoint masa depan yang disepakati adalah `GET /api/admin/dashboard/summary` dengan shape minimum:

```json
{
  "counts": {
    "totalTeams": 0,
    "waitingTeamReview": 0,
    "waitingPaymentReview": 0,
    "verifiedTeams": 0,
    "revisionRequired": 0,
    "rejected": 0
  },
  "registrationsByCompetition": [],
  "batchCapacity": [],
  "recentTeamQueue": [],
  "recentPaymentQueue": [],
  "recentActivities": [],
  "generatedAt": "ISO-8601"
}
```

Backend menghilangkan queue atau data yang tidak boleh dilihat role. Sampai endpoint tersedia, UI memakai `—` dan keterangan eksplisit `Menunggu summary admin`; tidak menghitung angka dari pagination.

## Acceptance dan pengujian

- Guest pada `/admin/*` diarahkan ke `/auth/login`; Team diarahkan ke `/dashboard`; Admin tetap di Admin Panel.
- Public Header/Footer dan music cursor tidak dirender pada `/admin/*`.
- Sidebar minimize persisten, mobile drawer accessible, active link benar, dan navigation mengikuti role.
- List Team memproses pagination Laravel yang nested dalam envelope canonical.
- Review Team menangani sukses, 422, 403, dan status yang tidak eligible.
- Competition dan Batch menghormati read-only/mutation role serta confirmation delete.
- Placeholder tidak memanggil endpoint yang belum tersedia.
- Layout diverifikasi pada 320px, 768px, 1024px, dan desktop lebar.
- Seluruh typecheck, build, formatting, dan test dijalankan lewat Docker.
