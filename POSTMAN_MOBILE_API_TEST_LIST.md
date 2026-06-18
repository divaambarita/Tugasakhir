# Postman – Mobile API Test List (SimbaciMobile)

Gunakan list ini sebagai **checklist pengujian endpoint API** untuk bukti integrasi FE–BE.

## Base
- **Base URL** (contoh lokal): `http://localhost:3000`
- Semua path di bawah diasumsikan diawali base URL.

## Saran Postman Environment
Biar enak di-copy, kamu bisa buat environment variable:
- `base_url` = `http://localhost:3000`
- `token` = token hasil login
- `bsuId`, `nasabahId`, `pengurusId`, `idPenarikan` (isi sesuai data uji)

## Header standar
- JSON request: `Content-Type: application/json`
- Auth (jika perlu): `Authorization: Bearer <TOKEN>`

## Catatan respons backend
Sebagian besar endpoint mengembalikan bentuk:
- Sukses: `{ "status": 200, "success": true, "data": ... }`
- Gagal: `{ "status": <code>, "success": false, "message": "...", "errors": [...] }`

---

# 1) Auth (dipakai semua role)

## 1.1 Login
- **POST** `/api/login`
- Auth: tidak
- Body (JSON):
```json
{ "noTelp": "08xxxxxxxxxx", "password": "passwordAnda" }
```
- Output penting untuk disimpan ke environment Postman:
  - `data.token`
  - `data.idAkun`
  - `data.roleName`

## 1.2 Uji pembatasan login Mobile (Admin/Pejabat = Web-only)
Tujuan: membuktikan integrasi FE–BE sekaligus membuktikan **logika error di mobile** berbasis `roleName` dari backend.

### Langkah (Postman)
1. Jalankan request **POST** `/api/login` menggunakan akun **Admin / Pejabat**.
2. Pastikan response sukses (`success: true`) dan terdapat `data.roleName`.
3. Screenshot response tersebut sebagai bukti bahwa backend mengembalikan `roleName`.

### Expected (Mobile)
Jika `roleName` bukan `nasabah` / `bsu` / `volunteer`, aplikasi Mobile Android menolak login dan menampilkan pesan:

"Akses Terbatas: Akun manajerial hanya dapat diakses melalui Dashboard Web. Silakan gunakan akun Nasabah, BSU, atau Volunteer untuk aplikasi Mobile Android."

### (Opsional) Script Postman untuk validasi otomatis
Tambahkan di tab **Tests** request login:
```javascript
const json = pm.response.json();
pm.test('Login response has roleName', function () {
  pm.expect(json).to.have.property('data');
  pm.expect(json.data).to.have.property('roleName');
});

pm.test('Mobile-only roles rule (nasabah/bsu/volunteer)', function () {
  const allowed = ['nasabah', 'bsu', 'volunteer'];
  const role = json?.data?.roleName;
  // This test will PASS for allowed roles and FAIL for web-only roles
  pm.expect(allowed, `roleName=${role} should be mobile-allowed`).to.include(role);
});
```

---

# 2) Upload File/Foto (dipakai beberapa flow)

## 2.1 Upload foto (Cloudinary)
- **POST** `/api/fileUpload`
- Auth: tidak (di mobile juga tidak mengirim token)
- Body: `multipart/form-data`
  - `kategori` (text), contoh: `transaksi` / `verifikasi` / `profile`
  - `file` (file), pilih foto
- Output: `data[0].path` adalah URL yang dipakai untuk field foto/dokumen.

---

# 3) Endpoint role BSU

## 3.1 Monitoring BSU
- **GET** `/api/monitoring/sampah/bsu/{bsuId}`
- Auth: Ya

- **GET** `/api/monitoring/saldo/bsu/{bsuId}`
- Auth: Ya

- **GET** `/api/monitoring/leaderboard/nasabah?idBsu={bsuId}` (opsional query)
- Auth: bisa Ya (mobile kadang kirim token)

## 3.1b Monitoring BSI (opsional – jika role BSI dipakai di mobile)
- **GET** `/api/monitoring/sampah/bsi/getMonitoringBsi`
- Auth: Ya

## 3.2 Anggota – Nasabah (BSU)
- **POST** `/api/bsu/nasabah/getNasabah`
- Auth: Ya
- Body (JSON):
```json
{ "idBsu": 4 }
```

- **GET** `/api/bsu/nasabah/{idNasabah}`
- Auth: Ya

- **DELETE** `/api/bsu/nasabah/{idNasabah}`
- Auth: Ya

## 3.3 Anggota – Pengurus (BSU)
Catatan: fitur UI list pengurus bisa di-disable di navigator, tapi endpoint masih ada.

- **POST** `/api/bsu/pengurus/getPengurus`
- Auth: Ya
- Body (JSON):
```json
{ "idBsu": 4 }
```

- **GET** `/api/bsu/pengurus/{idPengurus}`
- Auth: Ya

- **POST** `/api/bsu/pengurus/storePengurus`
- Auth: Ya
- Body (JSON) minimal:
```json
{
  "bsuId": 4,
  "namaPengurus": "Nama",
  "noTelp": "08xxxxxxxxxx",
  "tempatLahir": "-",
  "tglLahir": "2026-04-27",
  "jabatan": "Ketua"
}
```

- **DELETE** `/api/bsu/pengurus/{idPengurus}`
- Auth: Ya

## 3.4 Transaksi / Setoran Sampah + Bukti Foto (BSU)
Ini adalah fitur “mencatat setoran sampah” di BSU.

- **POST** `/api/transaksi/store`
- Auth: Ya
- Body (JSON) minimal (tanpa bukti):
```json
{
  "idNasabah": 123,
  "bsuId": 4,
  "items": [{ "idJenisSampah": 1, "berat": 2, "harga": 5000 }]
}
```
- Body (JSON) dengan bukti foto (disarankan untuk pengujian):
```json
{
  "idNasabah": 123,
  "bsuId": 4,
  "buktiFoto": "https://...url_dari_fileUpload...",
  "items": [{ "idJenisSampah": 1, "berat": 2, "harga": 5000 }]
}
```

- **GET** `/api/transaksi/{bsuId}?type=all` (atau `type=today`)
- Auth: Ya

- **GET** `/api/transaksi/detail/get/{date}`
- Auth: Ya

- **DELETE** `/api/transaksi/detail/delete/{transaksiId}`
- Auth: Ya
- Body (JSON):
```json
{ "transaksiId": "1", "jenisSampahId": "2" }
```

- **PUT** `/api/transaksi/detail/update/{transaksiId}?oldJenisSampahId={idJenisLama}`
- Auth: Ya
- Body (JSON):
```json
{ "jenisSampahId": 2, "beratsampah": 3 }
```

## 3.5 Jenis Sampah / Harga Sampah
- **GET** `/api/jenisSampah/getData/{id}`
- Auth: Ya

- **POST** `/api/jenisSampah/store`
- Auth: Ya
- Catatan: endpoint ini dipakai untuk create/update/upsert harga BSU.

- **DELETE** `/api/jenisSampah/delete`
- Auth: Ya
- Body (JSON):
```json
{ "idJenisSampah": 1, "bsuId": 4 }
```

## 3.6 Keuangan (BSU)
- **GET** `/api/keuangan/pemasukan/getPemasukan?bsuId={bsuId}`
- Auth: Ya

- **GET** `/api/keuangan/pengeluaran/getPengeluaran?bsuId={bsuId}`
- Auth: Ya

- **GET** `/api/keuangan/pemasukan/getPenjualan?bsuId={bsuId}`
- Auth: Ya

- **POST** `/api/keuangan/pemasukan/tambahPemasukanLainnya`
- Auth: Ya

- **POST** `/api/keuangan/pengeluaran/tambahPengeluaran`
- Auth: Ya

- **POST** `/api/keuangan/pemasukan/tambahPenjualan`
- Auth: Ya

- **DELETE** `/api/keuangan/delete`
- Auth: Ya
- Body (JSON) salah satu:
```json
{ "idPemasukan": 1 }
```
atau
```json
{ "idPengeluaran": 1 }
```

## 3.7 Penarikan (BSU)
- **GET** `/api/penarikan/storePenarikan?bsuId={bsuId}`
- Auth: Ya

- **POST** `/api/penarikan/storePenarikan`
- Auth: Ya
- Catatan: untuk role BSU, server default-nya bisa langsung membuat status berhasil (tergantung payload).

- **POST** `/api/penarikan/request/getRequest`
- Auth: Ya
- Body (JSON):
```json
{ "idBsu": "4" }
```

- **POST** `/api/penarikan/request/{idPenarikan}`
- Auth: Ya
- Body (JSON):
```json
{ "statusKonfirmasi": "Berhasil" }
```
atau
```json
{ "statusKonfirmasi": "Ditolak" }
```

## 3.8 Profile update (BSU)
- **POST** `/api/updateProfile`
- Auth: Ya
- Catatan: dipakai untuk update profil (termasuk foto URL hasil upload).

---

# 4) Endpoint role Nasabah

## 4.1 Monitoring nasabah
- **GET** `/api/monitoring/sampah/nasabah/{nasabahId}`
- Auth: Ya

## 4.2 Transaksi nasabah
- **GET** `/api/transaksi/{nasabahId}?type=all` (atau `type=today`)
- Auth: Ya

## 4.3 Penarikan (nasabah)
- **GET** `/api/penarikan/storePenarikan?nasabahId={nasabahId}`
- Auth: Ya

- **POST** `/api/penarikan/storePenarikan`
- Auth: Ya
- Body (JSON):
```json
{
  "nasabahId": 123,
  "totalPenarikan": "10000",
  "metodePembayaran": "Transfer",
  "tanggalPenarikan": "2026-04-27"
}
```

---

# 5) Endpoint role Volunteer

## 5.1 List BSU untuk verifikasi
- **POST** `/api/volunteer/getDataVerifikasi`
- Auth: Ya
- Body (JSON):
```json
{ "status": "WaitApv" }
```

## 5.2 Simpan hasil verifikasi
- **POST** `/api/volunteer/verifikasi`
- Auth: Ya
- Body (JSON) minimal:
```json
{
  "volunteerId": 7,
  "bsuId": 4,
  "lokasi": "Lokasi A",
  "dokumen": "https://...url_dari_fileUpload...",
  "luasTempat": "10x12",
  "kondisiBangunan": "Baik",
  "fasilitas": [{}]
}
```

## 5.3 Statistik & riwayat volunteer
- **GET** `/api/volunteer/stats?status=WaitApv` (query `status` opsional)
- Auth: Ya

- **GET** `/api/volunteer/riwayat`
- Auth: Ya

---

# 6) Endpoint lain yang dipakai oleh mobile (opsional untuk pengujian)

## 6.1 Signup Nasabah
- **POST** `/api/signup/nasabah`
- Auth: opsional (mobile kadang kirim token)

## 6.2 Signup Mitra
- **POST** `/api/signup/mitra`
- Auth: tidak

## 6.3 Approver (jika app dipakai untuk flow approval)
- **POST** `/api/approver/getApprover`
  - Auth: Ya
  - Body (JSON):
```json
{ "id": 123 }
```

- **GET** `/api/approver/{idApprover}`
  - Auth: Ya

- **POST** `/api/approver/updateStatus`
  - Auth: Ya
  - Body (JSON) contoh:
```json
{
  "idApprover": 1,
  "createdBy": 123,
  "status": "Approved",
  "keterangan": "OK",
  "dokumen": "https://...url_dari_fileUpload..."
}
```

## 6.4 Admin register staff (volunteer/dlh/pejabat)
- **POST** `/api/admin/registerStaff`
- Auth: Ya

## 6.5 Master data kategori sampah
- **GET** `/api/master/getKategoriSampah`
- Auth: opsional

## 6.5b Master data nasabah (admin)
- **GET** `/api/master/getNasabah`
- Auth: opsional (mobile menerima `token?`)

## 6.6 BSU admin list/detail/update/delete
- **GET** `/api/bsu/getDataBsu`
- **GET** `/api/bsu/{idBsu}`
- **POST** `/api/bsu/updateBsu`
- **DELETE** `/api/bsu/{idBsu}`
- Auth: Ya

## 6.7 Signup BSU (admin)
- **POST** `/api/signup/bsu`
- Auth: Ya
