import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { z } from "zod";

const CreateJenisSampahSchema = z.object({
  nama: z.string(),
  kategori: z.string(),
  hargaBsi: z.number().nullable(),
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

  const {
    nama,
    hargaBsi,
    hargaBsu,
    idHargaSampahBsu,
    kategori,
    idJenisSampah,
    bsuId,
  } = req.body;

  try {
    if (!bsuId) {
      if (!idJenisSampah) {
        const jenisSampah = await prisma.jenissampah.create({
          data: {
            nama,
            kategori,
            hargasampahbsi: {
              create: {
                harga: hargaBsi,
              },
            },
          },
        });
      } else {
        const jenisSampah = await prisma.jenissampah.update({
          where: { idJenisSampah: idJenisSampah },
          data: {
            nama: nama,
            kategori: kategori,
            hargasampahbsi: {
              update: {
                where: {
                  jenisSampahId: idJenisSampah,
                },
                data: { harga: hargaBsi },
              },
            },
          },
        });
      }
    } else {
      if (hargaBsu < hargaBsi) {
        return responseMessage(
          503,
          "Harga sampah BSU tidak boleh lebih rendah daripada harga sampah BSI",
          res
        );
      }
      const jenisSampah = await prisma.hargasampahbsu.findFirst({
        where: {
          jenisSampahId: idJenisSampah,
          bsuId: bsuId,
        },
      });

      if (!jenisSampah) {
        await prisma.hargasampahbsu.create({
          data: {
            harga: hargaBsu,
            jenisSampahId: idJenisSampah,
            bsuId: bsuId,
          },
        });
      } else {
        await prisma.hargasampahbsu.update({
          where: {
            idHargaSampahBsu: jenisSampah.idHargaSampahBsu,
            jenisSampahId: idJenisSampah,
            bsuId: bsuId,
          },
          data: {
            harga: hargaBsu,
          },
        });
      }
    }
    return responseMessage(200, "Data berhasil ditambahkan", res);
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}
