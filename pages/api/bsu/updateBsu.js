import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { z } from "zod";
import argon from "argon2";

const CreateJenisSampahSchema = z.object({
  idBsu: z.number(),
  nama: z.string().min(3),
  email: z.string().nullable(),
  noTelp: z.string().min(9),
  alamat: z.string().nullable(),
  kecamatan: z.string().nullable(),
  kelurahan: z.string().nullable(),
  foto: z.string().nullable(),
  roleId: z.number(),
  saldo: z.number().nullable(),
});

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status === 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (req.method !== "POST") {
    return responseMessage(res, 405, "Method Not Allowed");
  }

  const result = CreateJenisSampahSchema.safeParse(req.body);
  if (!result.success) {
    const error = result.error.issues;
    return responseError(error, res);
  }

  try {
    const { alamat, kelurahan, kecamatan, isActive, idBsu } = req.body;
    //delete object value null
    const body = nullObjectRemover(req.body);

    //hash password dan tambah status pada object body
    if (body.password) {
      body.password = await argon.hash(body.password);
    }

    delete body.confirmPassword;
    delete body.alamat;
    delete body.kelurahan;
    delete body.kecamatan;
    delete body.saldo;
    delete body.pengurus;
    delete body.fromAdmin;
    delete body.idBsu;
    delete body.isActive;

    //check akun
    const issetData = await prisma.akun.findFirst({
      where: {
        NOT: {
          idAkun: idBsu,
        },
        noTelp: body.noTelp,
      },
    });

    if (issetData) {
      return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
    }

    //insery akun
    await prisma.akun.update({
      where: {
        idAkun: idBsu,
      },
      data: body,
    });

    //jika berhasil data di input ke data admin/pejabat/dlh
    let showData = await prisma.akun.findFirst({
      where: {
        idAkun: idBsu,
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
    showData.isActive = isActive ?? null;
    delete showData.idAkun;

    showData = nullObjectRemover(showData);
    console.log(showData);

    await prisma.bsu.update({
      where: {
        idBsu: idBsu,
      },
      data: showData,
    });
    return responseMessage(200, "Data berhasil diupdate", res);
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}
