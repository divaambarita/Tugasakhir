import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { z } from "zod";
import argon from "argon2";

export default async function handler(req, res) {
  if (req.method === "POST") {
    //validasi request
    const userSchema = z.object({
      namaPerusahaan: z.string().min(3),
      alamatPerusahaan: z.string().nullable(),
      email: z.string().nullable(),
      kelurahan: z.string().nullable(),
      kecamatan: z.string().nullable(),
      jenisMitra: z.string().min(3),
      jenisInstansi: z.string().min(3),
      foto: z.string().nullable(),
      noTelp: z.string().min(9),
      password: z.string().min(6),
      roleId: z.number(),
    })

    const validate = userSchema.safeParse(req.body);

    if (!validate.success) {
      const error = validate.error.issues;
      return responseError(error, res);
    }

    try {
      const checkRole = await prisma.role.findUnique({
        where: {
          idRole: req.body.roleId,
          deletedAt: null,
        },
      });
      const listAdmin = ["mitra"];
      if (checkRole && !listAdmin.includes(checkRole.nama)) {
        return responseMessage(
          503,
          "Tidak dapat melakukan registrasi akun, role yang anda masukan tidak sesuai",
          res
        );
      }
      const {namaPerusahaan, alamatPerusahaan, kelurahan, kecamatan, jenisMitra, jenisInstansi} = req.body
      //delete object value null
      const body = nullObjectRemover(req.body);

      //hash password dan tambah status pada object body
      body.password = await argon.hash(body.password);
      body.nama = body.namaPerusahaan;

      delete body.namaPerusahaan;
      delete body.alamatPerusahaan;
      delete body.kelurahan;
      delete body.kecamatan;
      delete body.jenisMitra;
      delete body.jenisInstansi;

      //check akun
      const issetData = await prisma.akun.findUnique({
        where: {
          noTelp: body.noTelp,
          deletedAt: null,
        },
      });

      if (issetData) {
        return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
      }

      //insery akun
      await prisma.akun.create({
        data: body,
      });

      //jika berhasil data di input ke data admin/pejabat/dlh
      let showData = await prisma.akun.findFirst({
        where: {
          noTelp: body.noTelp,
          deletedAt: null,
        },
        select: {
          email: true,
          noTelp: true,
          idAkun: true,
        },
      });
      showData.namaPerusahaan = namaPerusahaan ?? null;
      showData.alamatPerusahaan = alamatPerusahaan?? null;
      showData.kelurahan = kelurahan ?? null;
      showData.kecamatan = kecamatan ?? null;
      showData.jenisMitra = jenisMitra ?? null;
      showData.jenisInstansi = jenisInstansi ?? null;
      showData.idMitra = showData.idAkun;
      delete showData.idAkun;
      delete showData.nama;

      showData = nullObjectRemover(showData);

      await prisma.mitra.create({
        data: showData,
      });

      return responseMessage(200, "Registrasi Berhasil", res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
