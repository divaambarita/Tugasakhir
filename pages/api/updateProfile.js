import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { z } from "zod";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const auth = verifyToken(req, res);
      if (auth.status == 401) {
        return responseMessage(auth.status, auth.message, res);
      }
      const userSchema = z.object({
        noTelp: z.string(),
        nama: z.string().min(3),
        alamat: z.string().min(3),
        // foto: z.string().min(3),
      });
      const validate = userSchema.safeParse(req.body);
      if (!validate.success) {
        const error = validate.error.issues;
        return responseError(error, res);
      }
      const user = await prisma.akun.findFirst({
        where: {
          deletedAt: null,
          noTelp: req.body.noTelp,
        },
        include: {
          role: true,
        },
      });
      if (!user) {
        return responseMessage(500, "Data tidak ditemukan.", res);
      }
      const checkNoTelp = await prisma.akun.findFirst({
        where: {
          deletedAt: null,
          noTelp: req.body.noTelp,
          NOT: {
            idAkun: req.body.idAkun,
          },
        },
      });
      if (checkNoTelp) {
        return responseMessage(500, "Data tidak ditemukan.", res);
      }

      const listAdmin = ["bsu"];
      if (!listAdmin.includes(user.role.nama)) {
        return responseMessage(
          503,
          "Tidak dapat melakukan update profile",
          res
        );
      }
      const { jadwal } = req.body;
      const body = req.body;
      delete body.jadwal;
      if ((user.role.nama = "bsu")) {
        let idJadwal = await prisma.jadwal.findMany({
          where: {
            bsuId: user.idAkun,
            deletedAt: null,
          },
        });
        idJadwal = idJadwal.map(({ idJadwal }) => idJadwal);
        await prisma.jadwal.deleteMany({
          where: {
            idJadwal: { in: idJadwal },
          },
        });
        await prisma.jadwal.create({
          data: {
            hari: jadwal.hari,
            jamMulai: new Date("2024-05-05 " + jadwal.jamMulai)
              .toISOString()
              .toString(),
            jamSelesai: new Date("2024-05-05 " + jadwal.jamSelesai)
              .toISOString()
              .toString(),
            bsuId: jadwal.bsuId,
          },
        });
        await prisma.bsu.update({
          where: {
            deletedAt: null,
            idBsu: user.idAkun,
          },
          data: {
            nama: body.nama,
            alamat: body.alamat,
            // email: body.email,
          },
        });
        await prisma.akun.update({
          where: {
            idAkun: user.idAkun,
          },
          data: {
            nama: body.nama,
            // email: body.email,
          },
        });
      }
      if (body.foto) {
        await prisma.akun.update({
          where: {
            idAkun: user.idAkun,
            deletedAt: null,
          },
          data: {
            foto: body.foto,
          },
        });
      }

      return responseMessage(200, "Berhasil", res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
