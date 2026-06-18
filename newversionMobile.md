# Fitur Mobile (SimbaciMobile)

Dokumen ini merangkum fitur yang ada di aplikasi **mobile** berdasarkan struktur navigasi dan layar yang ada di folder `SimbaciMobile/src/screens` dan `SimbaciMobile/src/navigation`.

## Cara kerja umum

- **Login**: pengguna masuk melalui layar Login.
- **Role-based UI**: setelah login, aplikasi menampilkan menu/fitur sesuai `roleName`.
- **Role yang dikenali aplikasi mobile**:
  - `bsu`
  - `nasabah`


## Struktur Project Mobile (Rinci)

Bagian ini menjelaskan struktur folder dan alur kerja utama aplikasi mobile.

### Entry point aplikasi

- `SimbaciMobile/index.js`
   - Mendaftarkan komponen aplikasi ke React Native (`AppRegistry.registerComponent`).
- `SimbaciMobile/App.tsx`
   - Membungkus app dengan:
      - `AuthProvider` (state login + persistent session)
      - `NavigationContainer` (React Navigation)
      - `RootNavigator` (routing utama berdasarkan role)

### Struktur folder `SimbaciMobile/src/`

#### 1) `src/config.ts`

- `API_BASE_URL`
   - Default: `http://10.0.2.2:3000` (khusus Android Emulator untuk mengakses host `localhost`).
- `buildApiUrl(path)`
   - Helper untuk membangun URL API.
   - Semua request API yang lewat `apiRequest()` akan otomatis memakai base URL ini.

Catatan penting:
- Android Emulator: `10.0.2.2` = host PC.
- iOS Simulator: biasanya pakai `http://localhost:3000`.
- Device fisik: gunakan `http://IP_LAN_PC:3000` (HP & PC harus 1 jaringan).

#### 2) `src/auth/`

Folder ini mengelola session pengguna.

- `AuthContext.tsx`
   - Menyediakan `useAuth()` dengan state:
      - `isRestoring` (loading saat restore session)
      - `user` (CurrentUser atau null)
      - `lastError` (pesan error terakhir, mis. login gagal / sesi habis)
   - Menyediakan aksi:
      - `login(noTelp, password)` → hit `/api/login`, simpan user
      - `logout()` → hapus user dari storage
   - Subscribe event “auth expired” agar kalau JWT expired, user otomatis `logout` dan balik ke Login.

- `authStorage.ts`
   - Persistent session menggunakan `react-native-keychain` (lebih aman dibanding AsyncStorage).
   - Menyimpan object `CurrentUser` (termasuk `token`) sebagai JSON.

- `authEvents.ts`
   - Event bus sederhana untuk kasus global: token expired / unauthorized.
   - Dipakai oleh layer API (non-React) untuk “meminta logout” tanpa memanggil hook.

- `types.ts`
   - Definisi tipe user/role (`CurrentUser`, `RoleName`).

#### 3) `src/api/`

Folder ini adalah *client* untuk semua endpoint backend (Next.js API) dan dipakai oleh screens.

- `client.ts`
   - `apiRequest(path, { method, token, body })`
      - Menambahkan header JSON.
      - Jika ada `token`, menambahkan `Authorization: Bearer <token>`.
      - Jika response `401` (atau message mengarah ke “jwt expired”), akan emit event auth-expired → app langsung balik ke Login.
   - `login(payload)`

- Modul per domain (contoh):
   - `penarikan.ts`, `transaksi.ts`, `keuangan.ts`, `jenisSampah.ts`, `monitoring.ts`, dll.
   - Pola umumnya: membungkus endpoint menjadi fungsi `getX()`, `createX()`, `updateX()`, dll.

- `fileUpload.ts`
   - Upload gambar via `FormData` (dipakai saat butuh kirim file).

#### 4) `src/navigation/`

untuk nav yang sudah ada halaman nya tidak perlu dihapus 

Folder ini mendefinisikan struktur navigasi (React Navigation).

- `RootNavigator.tsx`
   - Jika `user === null` → tampilkan stack `Login`.
   - Jika user login → pilih navigator sesuai role:
      - `admin` → `AdminTabsNavigator`
      - `bsu` → `BsuTabsNavigator`
      - `nasabah` → `NasabahTabsNavigator`
      - `volunteer` → `VolunteerTabsNavigator`
      - `pejabat_eswka` → `PejabatEswkaTabsNavigator`
      - `dlh` → `DlhTabsNavigator`
      - `approver` / `mitra` → `SingleHomeTabsNavigator` (Home saja)
   - Kondisi khusus: BSU dengan status `Rejected` akan masuk layar peringatan.

- `navigation/tabs/*`
   - Tab bar untuk tiap role utama.
   - Menggunakan `AppBottomTabBar` sebagai tab bar custom.

- `navigation/stacks/*`
   - Stack untuk modul-modul per tab (mis. transaksi list → detail → edit).

#### 5) `src/screens/`

Folder ini berisi halaman UI.

Pola grouping:
- `screens/admin/*` → layar admin
- `screens/bsu/*` → layar BSU
- `screens/nasabah/*` → layar nasabah
- `screens/leaderboard/*` → leaderboard
- `screens/role/*` → “home per role” (sebagian role memakai home ringkas/placeholder)
- Beberapa layar umum di root `screens/`:
   - `LoginScreen.tsx`, `ProfileScreen.tsx`, flow approval/verifikasi, dll.

#### 6) `src/components/`

Komponen reusable untuk UI.

- `components/ui/*`
   - Komponen dasar: `Screen`, `Card`, `AppButton`, `AppTextField`, `InlineAlert`, `SectionTitle`, `theme`, dll.
   - Tujuan: UI konsisten antar screen + gampang reuse.

- `AppBottomTabBar.tsx`
   - Tab bar custom yang dipakai semua navigator tabs.

#### 7) `src/utils/`

- `date.ts`
   - Helper tanggal untuk WIB (Asia/Jakarta) agar tanggal tidak “geser” karena UTC.

### Alur otentikasi (Login → App)

1. User login dari `LoginScreen`.
2. `AuthContext.login()` memanggil `api/login` (via `apiRequest`).
3. Jika sukses:
    - user + token disimpan ke Keychain
    - `RootNavigator` render navigator sesuai role.

### Alur ketika JWT expired (App → Login)

1. Screen memanggil API menggunakan `apiRequest(..., { token })`.
2. Jika backend balas `401` / pesan “jwt expired”:
    - `apiRequest()` emit event auth-expired.
3. `AuthProvider` menerima event → clear Keychain → `user=null`.
4. `RootNavigator` otomatis kembali ke stack `Login`.

---

## Fitur per Role

### 1) Admin

Tab utama:

1. **Home**
   - Monitoring ringkas (berbasis `AdminMonitoringScreen`).
   - Akses ke **Leaderboard Nasabah**.

2. **Daftar BSU**
   - Melihat daftar BSU.
   - **Tambah BSU** (via form registrasi BSU).
   - Melihat **detail BSU** dan melakukan **edit**.
   - Melihat daftar **Nasabah** milik BSU tertentu.
   - Melihat daftar **Pengurus** milik BSU tertentu.
   - Melihat daftar **Permintaan Penarikan (Konfirmasi Penarikan)** per-BSU dan melakukan aksi:
     - Set status menjadi **Berhasil** atau **Ditolak**.

3. **Approval**
   - Daftar approval BSU.
   - Detail approval.

4. **Buat Akun**
   - Admin dapat membuat akun staff untuk role:
     - `volunteer`
     - `pejabat_eswka`
     - `dlh`

5. **Jenis Sampah**
   - Daftar jenis sampah.
   - Tambah jenis sampah.
   - Detail jenis sampah (termasuk update data).
   - Field `kategori` menggunakan dropdown master kategori (sumber dari master kategori sampah).

6. **Profile**
   - Profil pengguna dan aksi terkait akun.

---

### 2) BSU

Tab utama:

1. **Monitoring**
   - Monitoring aktivitas/rekap data BSU.
   - Akses ke **Leaderboard Nasabah** (scope BSU).

2. **Anggota**
   - Kelola **Nasabah**:
     - daftar nasabah
     - tambah/edit nasabah
   - Kelola **Pengurus**:
     - daftar pengurus
     - tambah/edit pengurus

3. **Harga Sampah**
   - Daftar jenis sampah.
   - Detail harga per jenis sampah (harga BSI & harga BSU).

4. **Transaksi**
   - Daftar transaksi.
   - Tambah transaksi.
   - Lihat detail transaksi per tanggal.
   - Pada detail transaksi per tanggal:
     - **Edit** detail transaksi.
     - **Hapus** detail transaksi.

5. **Keuangan**
   - Daftar/rekap keuangan.
   - Tambah data:
     - Pemasukan
     - Pengeluaran
     - Penjualan sampah
   - Akses ke layar **Saldo**.
   - Akses ke modul **Penarikan**.

6. **Profile**
   - Profil pengguna BSU.

Modul Keuangan/Saldo/Penarikan (di dalam stack Keuangan):

- **Saldo**: melihat saldo/rekap.
- **Penarikan Saldo (BSU)**:
  - Riwayat penarikan.
  - Proses penarikan.
- **Konfirmasi Penarikan (Permintaan Nasabah)**:
  - Melihat daftar permintaan penarikan.
  - Mengubah status permintaan menjadi **Berhasil** atau **Ditolak**.

---

### 3) Nasabah

Tab utama:

1. **Saldo**
   - Ringkasan:
     - saldo saat ini
     - total pemasukan
     - total pengeluaran
   - Aksi cepat:
     - **Riwayat Penarikan**
     - **Monitoring Sampah**
     - **Tarik Saldo**

2. **Profile**
   - Profil pengguna nasabah.

Di dalam stack Saldo:

- **Riwayat Penarikan**: melihat histori penarikan.
- **Tarik Saldo**: membuat permintaan penarikan.
- **Monitoring**: monitoring aktivitas/setoran/rekap nasabah.

---

### 4) Volunteer

Tab utama:

1. **Verifikasi**
   - Daftar BSU untuk diverifikasi.
   - Form verifikasi untuk BSU tertentu.

2. **Profile**

---

### 5) Pejabat ESWKA

Tab utama:

1. **Verifikasi (Approval BSU)**
   - Daftar approval BSU.
   - Detail approval.

2. **Profile**

---

### 6) DLH

Tab utama:

1. **Verifikasi (Approval BSU)**
   - Daftar approval BSU.
   - Detail approval.

2. **Profile**

---

### 7) Approver

- Navigasi: single-tab (Home saja).
- Saat ini mengarah ke halaman Home role (placeholder / ringkas).

---

### 8) Mitra

- Navigasi: single-tab (Home saja).
- Saat ini mengarah ke halaman Home role (placeholder / ringkas).

---

## Catatan Implementasi Penting

- Aplikasi memisahkan fitur berdasarkan role agar menu tetap sederhana.
- Untuk modul yang sensitif (misalnya konfirmasi penarikan), layar melakukan pengecekan role di client dan tetap bergantung pada otorisasi backend.
