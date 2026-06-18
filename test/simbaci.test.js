// import supertest from "supertest";
// const url = "http://localhost:3000/api";

// describe("Registrasi Mitra", () => {
//   test("[Mitra] Registrasi berhasil - Positive Case ", async () => {
//     const { status } = await supertest(url).post("/signup/mitra").send({
//       namaPerusahaan: "PT Bubadibako",
//       alamatPerusahaan: "Rumah Adudu",
//       jenisMitra: "Mitra Pembeli",
//       jenisInstansi: "Perusahaan",
//       email: "@bubadibako@gmai.com",
//       kelurahan: "cilegon",
//       kecamatan: "cilegon",
//       noTelp: "039483908432",
//       password: "qwerty",
//       foto: null,
//       roleId: 7,
//     });
//     expect(status).toEqual(200);
//   });
//   test("[Mitra] Registrasi gagal, terdapat data yang tidak lengkap - Negative Case ", async () => {
//     const response = await supertest(url).post("/signup/mitra").send({
//       namaPerusahaan: "PT Bubadibako",
//       alamatPerusahaan: "Rumah Adudu",
//       jenisMitra: "Mitra Pembeli",
//       jenisInstansi: "Perusahaan",
//       email: null,
//       kelurahan: "cilegon",
//       kecamatan: null,
//       noTelp: null,
//       password: "qwerty",
//       foto: null,
//       roleId: 7,
//     });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual(
//       "notelp is expected string, received null"
//     );
//   });

//   test("[Mitra] Registrasi gagal, nomor telepon sudah terdaftar - Negative Case ", async () => {
//     const response = await supertest(url).post("/signup/mitra").send({
//       namaPerusahaan: "Linas Media",
//       alamatPerusahaan: "Jalan Perjuangan",
//       jenisMitra: "Sedekah",
//       jenisInstansi: "Instansi ABC",
//       email: null,
//       kelurahan: "Jatim",
//       kecamatan: null,
//       noTelp: "039483908432",
//       password: "qwerty",
//       foto: null,
//       roleId: 7,
//     });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual("Nomor Telepon Sudah Terdaftar");
//   });
// });

// describe("Registrasi BSU", () => {
//   test("[BSU] Registrasi berhasil - Positive Case ", async () => {
//     const { status } = await supertest(url)
//       .post("/signup/bsu")
//       .send({
//         nama: "Wish",
//         email: "wish@gmail.com",
//         noTelp: "03938490328",
//         alamat: "jalan",
//         kecamatan: "cilegon",
//         kelurahan: "cilegon",
//         password: "qwerty",
//         foto: null,
//         roleId: 4,
//         saldo: 100000,
//         pengurus: [
//           {
//             namaPengurus: "hosi",
//             email: "hosi@gmail.com",
//             noTelp: "0394830928",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Direktur",
//             tempatLahir: "cilegon",
//             tglLahir: "2010-06-15",
//             ktp: "",
//           },
//           {
//             namaPengurus: "jun",
//             email: "jun@gmail.com",
//             noTelp: "093840382043",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Manager Umum",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//           {
//             namaPengurus: "park",
//             email: "park@gmail.com",
//             noTelp: "0239483209423",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Manager Operasional",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//           {
//             namaPengurus: "Kim",
//             email: "kim@gmail.com",
//             noTelp: "023984398042",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Manager Keuangan",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//         ],
//       });
//     expect(status).toEqual(200);
//   });
//   test("[BSU] Registrasi gagal, terdapat data yang tidak lengkap - Negative Case ", async () => {
//     const response = await supertest(url)
//       .post("/signup/bsu")
//       .send({
//         nama: "Wish",
//         email: null,
//         noTelp: null,
//         alamat: "jalan",
//         kecamatan: "cilegon",
//         kelurahan: "cilegon",
//         password: "qwerty",
//         foto: null,
//         roleId: 4,
//         saldo: 100000,
//         pengurus: [
//           {
//             namaPengurus: "hosi",
//             email: null,
//             noTelp: "0394830928",
//             jenisKelamin: "Male", // Male or Female
//             alamat: null,
//             pekerjaan: null,
//             jabatan: "Direktur",
//             tempatLahir: "cilegon",
//             tglLahir: "2010-06-15",
//             ktp: "",
//           },
//           {
//             namaPengurus: "jun",
//             email: null,
//             noTelp: "093840382043",
//             jenisKelamin: "Male", // Male or Female
//             alamat: null,
//             pekerjaan: null,
//             jabatan: "Manager Umum",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//           {
//             namaPengurus: "park",
//             email: null,
//             noTelp: "0239483209423",
//             jenisKelamin: "Male", // Male or Female
//             alamat: null,
//             pekerjaan: null,
//             jabatan: "Manager Operasional",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//           {
//             namaPengurus: "Kim",
//             email: null,
//             noTelp: "023984398042",
//             jenisKelamin: "Male", // Male or Female
//             alamat: null,
//             pekerjaan: null,
//             jabatan: "Manager Keuangan",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//         ],
//       });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual(
//       "notelp is expected string, received null"
//     );
//   });

//   test("[BSU] Registrasi gagal, nomor telepon sudah terdaftar - Negative Case ", async () => {
//     const response = await supertest(url)
//       .post("/signup/bsu")
//       .send({
//         nama: "Wish",
//         email: "wish@gmail.com",
//         noTelp: "03938490328",
//         alamat: "jalan",
//         kecamatan: "cilegon",
//         kelurahan: "cilegon",
//         password: "qwerty",
//         foto: null,
//         roleId: 4,
//         saldo: 100000,
//         pengurus: [
//           {
//             namaPengurus: "hosi",
//             email: "hosi@gmail.com",
//             noTelp: "0394830928",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Direktur",
//             tempatLahir: "cilegon",
//             tglLahir: "2010-06-15",
//             ktp: "",
//           },
//           {
//             namaPengurus: "jun",
//             email: "jun@gmail.com",
//             noTelp: "0394830928",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Manager Umum",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//           {
//             namaPengurus: "park",
//             email: "park@gmail.com",
//             noTelp: "0394830928",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Manager Operasional",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//           {
//             namaPengurus: "Kim",
//             email: "kim@gmail.com",
//             noTelp: "0394830928",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Manager Keuangan",
//             tempatLahir: "Gresik",
//             tglLahir: "2000-10-10",
//             ktp: "",
//           },
//         ],
//       });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual("Nomor Telepon Sudah Terdaftar");
//   });

//   test("[BSU] Registrasi gagal, minimal register pengurus - Negative Case ", async () => {
//     const response = await supertest(url)
//       .post("/signup/bsu")
//       .send({
//         nama: "Wish",
//         email: "wish@gmail.com",
//         noTelp: "03938490328",
//         alamat: "jalan",
//         kecamatan: "cilegon",
//         kelurahan: "cilegon",
//         password: "qwerty",
//         foto: null,
//         roleId: 4,
//         saldo: 100000,
//         pengurus: [
//           {
//             namaPengurus: "hosi",
//             email: "hosi@gmail.com",
//             noTelp: "0394830928",
//             jenisKelamin: "Male", // Male or Female
//             alamat: "cilegon",
//             pekerjaan: "Mahasiswa",
//             jabatan: "Direktur",
//             tempatLahir: "cilegon",
//             tglLahir: "2010-06-15",
//             ktp: "",
//           },
//         ],
//       });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual("Minimal Terdapat 4 Pengurus");
//   });
// });

// describe("Login Test", () => {
//   test("[Login] Login berhasil - Positive Case ", async () => {
//     await supertest(url).post("/signup/pejabatAdmin").send({
//       nama: "Wulandari",
//       email: null,
//       noTelp: "0812328746",
//       password: "qwerty",
//       jabatan: null,
//       foto: null,
//       roleId: 1,
//     });
//     const { status } = await supertest(url).post("/login").send({
//       noTelp: "0812328746",
//       password: "qwerty",
//     });
//     expect(status).toEqual(200);
//   });
//   test("[Login] Salah password - Negative Case", async () => {
//     const response = await supertest(url).post("/login").send({
//       noTelp: "081232813044",
//       password: "salah password",
//     });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual(
//       "Password yang anda masukkan salah, mohon masukkan password dengan benar."
//     );
//   });

//   test("[Login] Akun tidak terdaftar - Negative Case", async () => {
//     const response = await supertest(url).post("/login").send({
//       noTelp: "0394802384",
//       password: "salah password",
//     });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual(
//       "Akun tidak terdaftar, silahkan melakukan registrasi."
//     );
//   });

//   test("[Login] Akun dalam proses verifikasi - Negative Case", async () => {
//     const response = await supertest(url).post("/login").send({
//       noTelp: "039483902843",
//       password: "qwerty",
//     });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual(
//       "Akun masih dalam proses verifikasi, silahkan menghubungi admin."
//     );
//   });

//   test("[Login] Akun tidak memiliki akses login - Negative Case", async () => {
//     const response = await supertest(url).post("/login").send({
//       noTelp: "03840882039",
//       password: "qwerty",
//     });
//     expect(response.status).not.toBe(200);
//     expect(response.body.message).toEqual(
//       "Gagal, akun anda tidak memiliki akses login."
//     );
//   });
// });
