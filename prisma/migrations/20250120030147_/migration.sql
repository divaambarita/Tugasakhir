-- CreateTable
CREATE TABLE `admin` (
    `idAdmin` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(16) NOT NULL,
    `jabatan` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `admin_noTelp_key`(`noTelp`),
    PRIMARY KEY (`idAdmin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `akun` (
    `idAkun` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(16) NOT NULL,
    `roleId` INTEGER NOT NULL,
    `password` TEXT NULL,
    `foto` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `akun_noTelp_key`(`noTelp`),
    INDEX `Akun_roleId_fkey`(`roleId`),
    PRIMARY KEY (`idAkun`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approver` (
    `idApprover` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `typePengajuan` VARCHAR(200) NOT NULL,
    `roleId` INTEGER NOT NULL,
    `roleName` VARCHAR(150) NOT NULL,
    `status` VARCHAR(150) NOT NULL,
    `updatedBy` INTEGER NULL,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Approver_userId_fkey`(`userId`),
    PRIMARY KEY (`idApprover`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bsu` (
    `idBsu` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(20) NOT NULL,
    `alamat` TEXT NULL,
    `kecamatan` VARCHAR(50) NULL,
    `kelurahan` VARCHAR(50) NULL,
    `saldo` DOUBLE NULL DEFAULT 0,
    `status` VARCHAR(25) NULL,
    `skPendirian` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `isActive` INTEGER NULL DEFAULT 0,

    UNIQUE INDEX `bsu_noTelp_key`(`noTelp`),
    PRIMARY KEY (`idBsu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dlh` (
    `idDlh` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(16) NOT NULL,
    `jabatan` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `dlh_noTelp_key`(`noTelp`),
    PRIMARY KEY (`idDlh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hargasampahbsi` (
    `idHargaSampahBsi` INTEGER NOT NULL AUTO_INCREMENT,
    `harga` DOUBLE NOT NULL,
    `jenisSampahId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `hargasampahbsi_jenisSampahId_key`(`jenisSampahId`),
    PRIMARY KEY (`idHargaSampahBsi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hargasampahbsu` (
    `idHargaSampahBsu` INTEGER NOT NULL AUTO_INCREMENT,
    `harga` DOUBLE NOT NULL,
    `jenisSampahId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bsuId` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`idHargaSampahBsu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hasilverifikasi` (
    `idHasilVerifikasi` INTEGER NOT NULL AUTO_INCREMENT,
    `lokasi` TEXT NOT NULL,
    `luasTempat` TEXT NOT NULL,
    `kondisiBangunan` TEXT NOT NULL,
    `fasilitas` TEXT NOT NULL,
    `fotoKunjungan` TEXT NOT NULL,
    `bsuId` INTEGER NOT NULL,
    `volunteerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `hasilverifikasi_bsuId_key`(`bsuId`),
    INDEX `hasilverifikasi_volunteerId_fkey`(`volunteerId`),
    PRIMARY KEY (`idHasilVerifikasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jabatan` (
    `idJabatan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NULL,
    `bsuId` INTEGER NULL,

    PRIMARY KEY (`idJabatan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal` (
    `idJadwal` INTEGER NOT NULL AUTO_INCREMENT,
    `hari` TEXT NOT NULL,
    `jamMulai` TIME(0) NOT NULL,
    `jamSelesai` TIME(0) NOT NULL,
    `bsuId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `jadwal_bsuId_key`(`bsuId`),
    PRIMARY KEY (`idJadwal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenissampah` (
    `idJenisSampah` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(150) NOT NULL,
    `kategori` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`idJenisSampah`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mitra` (
    `idMitra` INTEGER NOT NULL,
    `namaPerusahaan` VARCHAR(150) NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(16) NOT NULL,
    `alamatPerusahaan` TEXT NULL,
    `kelurahan` VARCHAR(50) NULL,
    `kecamatan` VARCHAR(50) NULL,
    `jenisMitra` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `jenisInstansi` VARCHAR(100) NULL,

    UNIQUE INDEX `mitra_noTelp_key`(`noTelp`),
    PRIMARY KEY (`idMitra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mstrjenisinstansi` (
    `idJenisInstansi` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NULL,

    PRIMARY KEY (`idJenisInstansi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mstrjenismitra` (
    `idJenisMitra` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NULL,

    PRIMARY KEY (`idJenisMitra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mstrkategorisampah` (
    `idKategoriSampah` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NULL,

    PRIMARY KEY (`idKategoriSampah`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nasabah` (
    `idNasabah` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `jenisKelamin` VARCHAR(25) NULL,
    `Nik` VARCHAR(20) NOT NULL,
    `noTelp` VARCHAR(20) NOT NULL,
    `alamat` TEXT NULL,
    `tempatLahir` VARCHAR(50) NOT NULL,
    `tglLahir` DATE NOT NULL,
    `kelurahan` VARCHAR(50) NULL,
    `kecamatan` VARCHAR(50) NULL,
    `saldo` DOUBLE NULL DEFAULT 0,
    `bsuId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `nasabah_noTelp_key`(`noTelp`),
    INDEX `Nasabah_bsuId_fkey`(`bsuId`),
    PRIMARY KEY (`idNasabah`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pejabateswka` (
    `idPejabatEswka` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(16) NOT NULL,
    `jabatan` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `pejabateswka_noTelp_key`(`noTelp`),
    PRIMARY KEY (`idPejabatEswka`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengurus` (
    `idPengurus` INTEGER NOT NULL,
    `namaPengurus` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(20) NOT NULL,
    `jenisKelamin` VARCHAR(25) NULL,
    `alamat` TEXT NULL,
    `tempatLahir` VARCHAR(50) NOT NULL,
    `tglLahir` DATE NOT NULL,
    `pekerjaan` TEXT NULL,
    `jabatan` TEXT NULL,
    `ktp` TEXT NULL,
    `bsuId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `pengurus_noTelp_key`(`noTelp`),
    INDEX `Pengurus_bsuId_fkey`(`bsuId`),
    PRIMARY KEY (`idPengurus`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengeluaran` (
    `tanggal` DATETIME(3) NOT NULL,
    `tujuan` VARCHAR(191) NOT NULL,
    `saldo` DOUBLE NOT NULL,
    `bukti` VARCHAR(191) NOT NULL,
    `totalPengeluaran` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idPengeluaran` INTEGER NOT NULL AUTO_INCREMENT,
    `bsuId` INTEGER NOT NULL,

    INDEX `Pengeluaran_bsuId_fkey`(`bsuId`),
    PRIMARY KEY (`idPengeluaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pemasukan` (
    `tanggal` DATETIME(3) NOT NULL,
    `tujuan` VARCHAR(191) NOT NULL,
    `saldo` DOUBLE NOT NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `totalPemasukan` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idPemasukan` INTEGER NOT NULL AUTO_INCREMENT,
    `bsuId` INTEGER NOT NULL,

    INDEX `Pemasukan_bsuId_fkey`(`bsuId`),
    PRIMARY KEY (`idPemasukan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penjualan` (
    `tanggal` DATETIME(3) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `berat` DOUBLE NOT NULL,
    `harga` DOUBLE NOT NULL,
    `totalPenjualan` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idPenjualan` INTEGER NOT NULL AUTO_INCREMENT,
    `bsuId` INTEGER NOT NULL,
    `jenisSampahId` INTEGER NOT NULL,

    INDEX `Penjualan_bsuId_fkey`(`bsuId`),
    INDEX `Penjualan_jenisSampahId_fkey`(`jenisSampahId`),
    PRIMARY KEY (`idPenjualan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `idRole` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NULL,
    `hakAkses` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`idRole`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `volunteer` (
    `idVolunteer` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(16) NOT NULL,
    `jabatan` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `volunteer_noTelp_key`(`noTelp`),
    PRIMARY KEY (`idVolunteer`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi` (
    `idTransaksi` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL,
    `nasabahId` INTEGER NOT NULL,
    `totalHarga` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaksi_nasabahId_fkey`(`nasabahId`),
    PRIMARY KEY (`idTransaksi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksidetail` (
    `berat` DOUBLE NULL,
    `hargaTotal` DOUBLE NULL,
    `transaksiId` INTEGER NOT NULL,
    `jenisSampahId` INTEGER NOT NULL,

    INDEX `transaksidetail_jenisSampahId_fkey`(`jenisSampahId`),
    PRIMARY KEY (`transaksiId`, `jenisSampahId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembeli` (
    `idPembeli` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `noTelp` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `pembeli_noTelp_key`(`noTelp`),
    PRIMARY KEY (`idPembeli`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesanan` (
    `idPesanan` INTEGER NOT NULL,
    `totalHarga` DOUBLE NOT NULL,
    `status` ENUM('GAGAL', 'DIPROSES', 'BERHASIL') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idPesanan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembayaran` (
    `idPembayaran` INTEGER NOT NULL AUTO_INCREMENT,
    `jumlah` DECIMAL(65, 30) NOT NULL,
    `metodePembayaran` VARCHAR(50) NOT NULL,
    `statusPembayaran` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idPembayaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itempesanan` (
    `idItemPesanan` INTEGER NOT NULL,
    `kuantitas` INTEGER NOT NULL,
    `jenisSampahId` INTEGER NOT NULL,
    `pesananId` INTEGER NOT NULL,

    UNIQUE INDEX `itempesanan_jenisSampahId_key`(`jenisSampahId`),
    UNIQUE INDEX `itempesanan_pesananId_key`(`pesananId`),
    PRIMARY KEY (`idItemPesanan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penarikan` (
    `idPenarikan` INTEGER NOT NULL AUTO_INCREMENT,
    `nasabahId` INTEGER NOT NULL,
    `tanggalPenarikan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalPenarikan` DOUBLE NOT NULL,
    `metodePembayaran` VARCHAR(50) NOT NULL,
    `statusKonfirmasi` VARCHAR(50) NOT NULL,
    `tanggalKonfirmasi` DATETIME(3) NULL,

    INDEX `Penarikan_nasabahId_fkey`(`nasabahId`),
    PRIMARY KEY (`idPenarikan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `akun` ADD CONSTRAINT `akun_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`idRole`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `approver` ADD CONSTRAINT `approver_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hargasampahbsi` ADD CONSTRAINT `hargasampahbsi_jenisSampahId_fkey` FOREIGN KEY (`jenisSampahId`) REFERENCES `jenissampah`(`idJenisSampah`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hasilverifikasi` ADD CONSTRAINT `hasilverifikasi_bsuId_fkey` FOREIGN KEY (`bsuId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hasilverifikasi` ADD CONSTRAINT `hasilverifikasi_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `volunteer`(`idVolunteer`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jadwal` ADD CONSTRAINT `jadwal_bsuId_fkey` FOREIGN KEY (`bsuId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `nasabah` ADD CONSTRAINT `nasabah_bsuId_fkey` FOREIGN KEY (`bsuId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pengurus` ADD CONSTRAINT `pengurus_bsuId_fkey` FOREIGN KEY (`bsuId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pengeluaran` ADD CONSTRAINT `pengeluaran_bsuId_fkey` FOREIGN KEY (`bsuId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pemasukan` ADD CONSTRAINT `pemasukan_bsuId_fkey` FOREIGN KEY (`bsuId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `penjualan` ADD CONSTRAINT `penjualan_bsuId_fkey` FOREIGN KEY (`bsuId`) REFERENCES `bsu`(`idBsu`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `penjualan` ADD CONSTRAINT `penjualan_jenisSampahId_fkey` FOREIGN KEY (`jenisSampahId`) REFERENCES `jenissampah`(`idJenisSampah`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_nasabahId_fkey` FOREIGN KEY (`nasabahId`) REFERENCES `nasabah`(`idNasabah`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transaksidetail` ADD CONSTRAINT `transaksidetail_jenisSampahId_fkey` FOREIGN KEY (`jenisSampahId`) REFERENCES `jenissampah`(`idJenisSampah`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transaksidetail` ADD CONSTRAINT `transaksidetail_transaksiId_fkey` FOREIGN KEY (`transaksiId`) REFERENCES `transaksi`(`idTransaksi`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itempesanan` ADD CONSTRAINT `itempesanan_jenisSampahId_fkey` FOREIGN KEY (`jenisSampahId`) REFERENCES `jenissampah`(`idJenisSampah`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itempesanan` ADD CONSTRAINT `itempesanan_pesananId_fkey` FOREIGN KEY (`pesananId`) REFERENCES `pesanan`(`idPesanan`) ON DELETE NO ACTION ON UPDATE NO ACTION;
