INSERT INTO mstrjenismitra (nama) VALUES ('Mitra Pembeli');
INSERT INTO mstrjenismitra (nama) VALUES ('Mitra Sedekah');
INSERT INTO mstrjenisinstansi (nama) VALUES ('Pendidikan');
INSERT INTO mstrjenisinstansi (nama) VALUES ('Perusahaan');
INSERT INTO Jabatan (nama) VALUES ("Direktur");
INSERT INTO Jabatan (nama) VALUES ("Manager Umum");
INSERT INTO Jabatan (nama) VALUES ("Manager Produksi");
INSERT INTO Jabatan (nama) VALUES ("Manager Keuangan");
INSERT INTO Jabatan (nama) VALUES ("Staff Tata Usaha dan Penyuluhan");
INSERT INTO Jabatan (nama) VALUES ("Staff Pemilihan dan Pengumpulan");
INSERT INTO Jabatan (nama) VALUES ("Staff Penyimpanan");
INSERT INTO Jabatan (nama) VALUES ("Staff Pengolahan");
INSERT INTO Jabatan (nama) VALUES ("Staff Teller");
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (1, 'admin', '["approver","bsu","jenis_sampah","login"]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (3, 'dlh', '["approver","login"]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (2, 'pejabat_eswka', '["approver","login"]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (4, 'bsu', '["bsu","login"]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (5, 'pengurus', '[]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (6, 'nasabah', '["login"]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (7, 'mitra', '[]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
    INSERT INTO `simbaci`.`Role`(idRole,nama,hakAkses,createdAt,updatedAt,deletedAt) VALUES (8, 'volunteer', '["login","verifikasi"]', '2024-05-23 13:08:13.000', '2024-05-23 13:08:13.000', NULL);
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (1, 'Limbah B3');
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (2, 'Sampah Organik (Mudah Terurai)');
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (3, 'Sampah Anorganik (Plastik)');
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (4, 'Sampah Anorganik (Kertas)');
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (5, 'Sampah Anorganik (Logam)');
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (6, 'Sampah Anorganik (Kaca)');
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (7, 'Sampah Anorganik (Karet)');
INSERT INTO `simbaci`.`mstrkategorisampah` (`idKategoriSampah`, `nama`) VALUES (8, 'Sampah Anorganik (Tekstil)');

-- ============================================
-- DATA BSU TERVERIFIKASI MINIMAL
-- ============================================

-- 1. Insert Akun BSU Terverifikasi
INSERT INTO `akun` (`nama`, `email`, `noTelp`, `roleId`, `password`, `foto`, `createdAt`, `updatedAt`) VALUES 
('BSU Mandiri Sejahtera', 'bsu.mandiri@email.com', '08123456789', 4, '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword', NULL, NOW(), NOW());

-- 2. Insert Data BSU (Langsung dengan status Approved dan isActive = 1)
INSERT INTO `bsu` (`idBsu`, `nama`, `email`, `noTelp`, `alamat`, `kecamatan`, `kelurahan`, `saldo`, `status`, `skPendirian`, `isActive`, `createdAt`, `updatedAt`) VALUES 
(LAST_INSERT_ID(), 'BSU Mandiri Sejahtera', 'bsu.mandiri@email.com', '08123456789', 'Jl. Lingkungan Hijau No. 123, RT 01/RW 05', 'Kemayoran', 'Kebon Kosong', 0, 'Approved', 'uploads/sk_pendirian_bsu_001.pdf', 1, NOW(), NOW());

-- Set variable untuk ID BSU
SET @bsu_id = LAST_INSERT_ID();

-- 3. Insert Akun Pengurus BSU (4 pengurus wajib untuk memenuhi persyaratan sistem)
-- Pengurus 1: Direktur
INSERT INTO `akun` (`nama`, `email`, `noTelp`, `roleId`, `password`, `foto`, `createdAt`, `updatedAt`) VALUES 
('Ahmad Suryanto', 'ahmad.direktur@email.com', '08111111001', 5, '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword', NULL, NOW(), NOW());

INSERT INTO `pengurus` (`idPengurus`, `namaPengurus`, `email`, `noTelp`, `jenisKelamin`, `alamat`, `tempatLahir`, `tglLahir`, `pekerjaan`, `jabatan`, `ktp`, `bsuId`, `createdAt`, `updatedAt`) VALUES 
(LAST_INSERT_ID(), 'Ahmad Suryanto', 'ahmad.direktur@email.com', '08111111001', 'Laki-laki', 'Jl. Mawar No. 15, Jakarta', 'Jakarta', '1985-05-15', 'Wiraswasta', 'DIREKTUR', 'uploads/ktp_direktur.jpg', @bsu_id, NOW(), NOW());

-- Pengurus 2: Manager Umum
INSERT INTO `akun` (`nama`, `email`, `noTelp`, `roleId`, `password`, `foto`, `createdAt`, `updatedAt`) VALUES 
('Siti Rahayu', 'siti.manager@email.com', '08222222001', 5, '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword', NULL, NOW(), NOW());

INSERT INTO `pengurus` (`idPengurus`, `namaPengurus`, `email`, `noTelp`, `jenisKelamin`, `alamat`, `tempatLahir`, `tglLahir`, `pekerjaan`, `jabatan`, `ktp`, `bsuId`, `createdAt`, `updatedAt`) VALUES 
(LAST_INSERT_ID(), 'Siti Rahayu', 'siti.manager@email.com', '08222222001', 'Perempuan', 'Jl. Melati No. 8, Jakarta', 'Bandung', '1987-08-22', 'Pegawai Swasta', 'MANAGER UMUM', 'uploads/ktp_manager_umum.jpg', @bsu_id, NOW(), NOW());

-- Pengurus 3: Manager Produksi
INSERT INTO `akun` (`nama`, `email`, `noTelp`, `roleId`, `password`, `foto`, `createdAt`, `updatedAt`) VALUES 
('Budi Santoso', 'budi.produksi@email.com', '08333333001', 5, '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword', NULL, NOW(), NOW());

INSERT INTO `pengurus` (`idPengurus`, `namaPengurus`, `email`, `noTelp`, `jenisKelamin`, `alamat`, `tempatLahir`, `tglLahir`, `pekerjaan`, `jabatan`, `ktp`, `bsuId`, `createdAt`, `updatedAt`) VALUES 
(LAST_INSERT_ID(), 'Budi Santoso', 'budi.produksi@email.com', '08333333001', 'Laki-laki', 'Jl. Anggrek No. 12, Jakarta', 'Surabaya', '1990-03-10', 'Teknisi', 'MANAGER PRODUKSI', 'uploads/ktp_manager_produksi.jpg', @bsu_id, NOW(), NOW());

-- Pengurus 4: Manager Keuangan
INSERT INTO `akun` (`nama`, `email`, `noTelp`, `roleId`, `password`, `foto`, `createdAt`, `updatedAt`) VALUES 
('Dewi Lestari', 'dewi.keuangan@email.com', '08444444001', 5, '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword', NULL, NOW(), NOW());

INSERT INTO `pengurus` (`idPengurus`, `namaPengurus`, `email`, `noTelp`, `jenisKelamin`, `alamat`, `tempatLahir`, `tglLahir`, `pekerjaan`, `jabatan`, `ktp`, `bsuId`, `createdAt`, `updatedAt`) VALUES 
(LAST_INSERT_ID(), 'Dewi Lestari', 'dewi.keuangan@email.com', '08444444001', 'Perempuan', 'Jl. Dahlia No. 20, Jakarta', 'Yogyakarta', '1988-12-05', 'Akuntan', 'MANAGER KEUANGAN', 'uploads/ktp_manager_keuangan.jpg', @bsu_id, NOW(), NOW());