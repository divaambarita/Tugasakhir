# Gap Analysis: Web vs Mobile

Dokumen ini membandingkan fitur **Web (Next.js di folder `pages/`)** dengan **Mobile (`SimbaciMobile`)**.

Tujuan:
- Mengidentifikasi fitur yang sudah ada di salah satu platform tetapi belum ada/kurang lengkap di platform lainnya.
- Menangkap perbedaan *flow* penting yang berdampak ke operasional (contoh: penarikan saldo).

---

## Ringkasan Cepat

- **Keduanya sama-sama punya** modul inti: Monitoring, Jenis Sampah, Transaksi, Keuangan, serta sebagian manajemen Nasabah/Pengurus.
- **Mobile lebih kuat** di dukungan multi-role dan flow *konfirmasi penarikan* (ada layar khusus untuk mengubah status permintaan).
- **Web lebih kuat** pada fitur onboarding/pendaftaran (signup) dan modul `survey`.

---

## Cakupan Role

### Role yang jelas ada di Mobile
- admin, bsu, nasabah, volunteer, pejabat_eswka, dlh, approver, mitra.

### Role yang tampak dominan di Web
- admin & bsu (berdasarkan helper `isRoleAdmin`, `isRoleBSU`, dan struktur halaman).
- ada halaman `approver/`.

**Gap (Web vs Mobile):**
- Web belum terlihat memiliki halaman khusus untuk **volunteer**, **pejabat_eswka**, dan **dlh** (sementara mobile punya tab khusus untuk verifikasi/approval untuk role-role tersebut).

---

## Perbedaan Flow Penting

### 1) Penarikan Saldo Nasabah

**Mobile**
- Nasabah dapat membuat **permintaan penarikan**.
- BSU memiliki layar **Konfirmasi Penarikan** untuk mengubah status permintaan menjadi `Berhasil` atau `Ditolak`.
- Admin juga memiliki layar **Konfirmasi Penarikan per-BSU** (admin bisa mengubah status untuk penarikan di BSU tertentu).

**Web**
- Halaman `penarikan-saldo` menampilkan riwayat dan aksi **Lihat** (tanpa aksi ubah status di tabel).
- Proses penarikan untuk nasabah dilakukan lewat form `saldo/add-penarikan-saldo` (role BSU), dan komentar di form menunjukkan penarikan diproses langsung (bukan request yang menunggu konfirmasi).
- Web juga memiliki halaman `saldo/` yang menampilkan ringkasan saldo nasabah dan riwayat penarikan, namun beberapa metrik (mis. total pemasukan/pengeluaran) masih berupa placeholder.

**Gap (Web vs Mobile):**
- Web belum memiliki UI yang setara dengan **Konfirmasi Penarikan (Approve/Reject)** seperti di mobile.
- Web belum terlihat menyediakan flow **Nasabah mengajukan request penarikan** seperti di mobile.

### 2) Tanggal & Timezone (WIB)

**Mobile**
- Beberapa tampilan tanggal dan default tanggal sudah diarahkan memakai konversi `Asia/Jakarta` untuk menghindari pergeseran tanggal.

**Web**
- Masih ada pola penggunaan `new Date(...).toISOString()` / pemotongan string tanggal (`split('T')[0]`) di beberapa tempat, dan ada juga penambahan jam manual `addHours(7)` pada form penarikan.

**Gap (Web vs Mobile):**
- Web berpotensi lebih sering mengalami inkonsistensi tanggal jika input/output ISO diperlakukan sebagai UTC tanpa konversi yang konsisten.

---

## Modul: Ada di Kedua Platform (Relatif Parity)

Catatan: “parity” di sini berarti modulnya ada di dua platform, meskipun UI/fiturnya bisa berbeda.

- **Monitoring**
  - Web: `pages/monitoring/bsu/index.jsx` dan `pages/monitoring/[id].jsx` (monitoring nasabah).
  - Mobile: Monitoring BSU, Monitoring Nasabah.

- **Leaderboard**
  - Web: `pages/leaderboard/index.jsx`.
  - Mobile: Leaderboard dapat diakses dari monitoring admin dan monitoring BSU.

- **Transaksi**
  - Web: daftar sesi transaksi, detail transaksi via modal, edit/hapus detail.
  - Mobile: daftar transaksi, tambah transaksi, detail per tanggal, edit/hapus detail.

- **Jenis Sampah / Harga Sampah**
  - Web: modul `jenis-sampah` dan versi admin `admin/jenis-sampah`.
  - Mobile: admin mengelola jenis sampah; BSU melihat/kelola harga (tergantung implementasi detail screen).

- **Keuangan**
  - Web: `pages/keuangan/*`.
  - Mobile: layar keuangan + tambah pemasukan/pengeluaran/penjualan.

---

## Modul yang Ada di Web tetapi Belum Terlihat di Mobile

- **Survey**
  - Web memiliki `pages/survey/*`.
  - Di mobile belum terlihat layar survey yang setara.

- **Signup / Pendaftaran Akun**
  - Web memiliki `pages/signup/` (BSU / Mitra / Nasabah) dan `pages/signup.js`.
  - Di mobile, onboarding yang terlihat adalah login + admin membuat akun staff + admin mendaftarkan BSU (bukan signup mandiri untuk semua role).

---

## Modul yang Ada di Mobile tetapi Belum Terlihat di Web

- **Volunteer: Verifikasi BSU** (tab verifikasi + form)
- **Pejabat ESWKA & DLH: Verifikasi/Approval** dalam tab tersendiri (mobile)
- **Flow konfirmasi penarikan** (ubah status Berhasil/Ditolak) untuk BSU dan Admin

---

## Rekomendasi Fokus (Jika targetnya parity)

1. Web: tambahkan UI untuk **Konfirmasi Penarikan** (ubah status) jika flow “request penarikan” ingin disamakan dengan mobile.
2. Tentukan satu standar pengolahan tanggal WIB (utility terpusat) agar output di web konsisten.
3. Lengkapi dashboard saldo nasabah di web (total pemasukan/pengeluaran dan shortcut monitoring) jika ingin setara dengan pengalaman mobile.
