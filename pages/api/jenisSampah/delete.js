import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { z } from "zod";
export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status === 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (req.method !== "DELETE") {
    return responseMessage(405, "Method Not Allowed", res);
  }
  const CreateJenisSampahSchema = z.object({
    idJenisSampah: z.number(),
  });

  try {
    const result = CreateJenisSampahSchema.safeParse(req.body);
    if (!result.success) {
      const error = result.error.issues;
      return responseError(error, res);
    }
    const body = req.body;

    if (!body.bsuId) {
      await prisma.hargasampahbsu.deleteMany({
        where: {
          jenisSampahId: body.idJenisSampah,
        },
      });
      await prisma.hargasampahbsi.deleteMany({
        where: {
          jenisSampahId: body.idJenisSampah,
        },
      });
      await prisma.jenissampah.delete({
        where: {
          idJenisSampah: body.idJenisSampah,
        },
      });
    } else {
      const jenisSampah = await prisma.hargasampahbsu.findFirst({
        where: {
          jenisSampahId: body.idJenisSampah,
          bsuId: body.bsuId,
        },
      });
      if (jenisSampah) {
        await prisma.hargasampahbsu.delete({
          where: {
            idHargaSampahBsu: jenisSampah.idHargaSampahBsu,
          },
        });
      }
    }

    return responseMessage(200, "Data Berhasil Dihapus", res);
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}
