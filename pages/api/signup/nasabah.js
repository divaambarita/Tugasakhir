import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { z } from "zod";
import argon from "argon2";

export default async function handler(req, res) {
  if (req.body.fromBsu == 0) {
    const auth = verifyToken(req, res);
    if (auth.status == 401) {
      return responseMessage(auth.status, auth.message, res);
    }
  }
  if (req.method === "POST") {
    //validasi request
    const userSchema = z.object({
      nama: z.string().min(3),
      nomorNasabah: z.string().nullable(),
      email: z.string().nullable(),
      jenisKelamin: z.string().min(3),
      Nik: z.string().max(16),
      noTelp: z.string().min(9),
      alamat: z.string().nullable(),
      tempatLahir: z.string().min(3),
      tglLahir: z.string().min(8),
      kelurahan: z.string().nullable(),
      kecamatan: z.string().nullable(),
      foto: z.string().nullable(),
      saldo: z.number().nullable(),
      roleId: z.number(),
      bsuId: z.number(),
    });

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
      const listAdmin = ["nasabah"];
      if (checkRole && !listAdmin.includes(checkRole.nama)) {
        return responseMessage(
          503,
          "Tidak dapat melakukan registrasi akun, role yang anda masukan tidak sesuai",
          res
        );
      }
      const {
        alamat,
        nomorNasabah,
        kelurahan,
        kecamatan,
        jenisKelamin,
        Nik,
        bsuId,
        tempatLahir,
        tglLahir,
        saldo,
        idNasabah,
        fromBsu,
      } = req.body;
      //delete object value null
      const body = nullObjectRemover(req.body);
      if (!idNasabah && !body.password) {
        return responseMessage(
          503,
          "Password Wajib Diisi, minimal 6 karakter",
          res
        );
      }
      if (!idNasabah && body.password.length < 6) {
        return responseMessage(
          503,
          "Password Wajib Diisi, minimal 6 karakter",
          res
        );
      }
      if (body.password) {
        //hash password dan tambah status pada object body
        body.password = await argon.hash(body.password);
      }

      delete body.alamat;
      delete body.nomorNasabah;
      delete body.kelurahan;
      delete body.kecamatan;
      delete body.jenisKelamin;
      delete body.Nik;
      delete body.bsuId;
      delete body.tempatLahir;
      delete body.tglLahir;
      delete body.saldo;
      delete body.idNasabah;
      delete body.fromBsu;

      //check akun
      let issetData = null;
      if (idNasabah) {
        issetData = await prisma.akun.findFirst({
          where: {
            AND: {
              noTelp: body.noTelp,
              deletedAt: null,
            },
            NOT: {
              idAkun: idNasabah,
            },
          },
        });
      } else {
        issetData = await prisma.akun.findFirst({
          where: {
            noTelp: body.noTelp,
            deletedAt: null,
          },
        });
      }

      if (issetData) {
        return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
      }

      const checkBsuid = await prisma.bsu.findUnique({
        where: {
          idBsu: bsuId,
        },
      });
      if (!checkBsuid) {
        return responseMessage(503, "Bsu Tidak Terdaftar", res);
      }

      //insert akun
      if (idNasabah) {
        const issetAkun = await prisma.akun.findFirst({
          where: {
            noTelp: body.noTelp,
            NOT: {
              idAkun: idNasabah,
            },
          },
        });
        if (issetAkun) {
          return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
        }
        await prisma.akun.update({
          where: {
            idAkun: idNasabah,
          },
          data: body,
        });
      } else {
        delete body.idNasabah;
        await prisma.akun.create({
          data: body,
        });
      }

      let showData = await prisma.akun.findFirst({
        where: {
          noTelp: body.noTelp,
          deletedAt: null,
        },
        select: {
          nama: true,
          email: true,
          noTelp: true,
          idAkun: true,
        },
      });
      showData.alamat = alamat ?? null;
      showData.kelurahan = kelurahan ?? null;
      showData.kecamatan = kecamatan ?? null;
      showData.jenisKelamin = jenisKelamin ?? null;
      showData.idNasabah = showData.idAkun;
      showData.nomorNasabah = nomorNasabah ?? null;
      showData.Nik = Nik ?? null;
      showData.bsuId = bsuId ?? null;
      showData.tempatLahir = tempatLahir ?? null;
      showData.tglLahir = new Date(tglLahir);
      showData.saldo = saldo ?? null;
      delete showData.idAkun;

      showData = nullObjectRemover(showData);
      if (idNasabah) {
        const issetAkun = await prisma.nasabah.findFirst({
          where: {
            noTelp: body.noTelp,
            NOT: {
              idNasabah,
            },
          },
        });
        if (issetAkun) {
          return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
        }
        await prisma.nasabah.update({
          where: {
            idNasabah,
          },
          data: showData,
        });
      } else {
        await prisma.nasabah.create({
          data: showData,
        });
      }

      return responseMessage(200, "Data Berhasil Ditambahkan", res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
