import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";
import { z } from "zod";

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }
  if (req.method === "POST") {
    try {
      const userSchema = z.object({
        idBsu: z.number().min(1),
      });

      const validate = userSchema.safeParse(req.body);

      if (!validate.success) {
        const error = validate.error.issues;
        return responseError(error, res);
      }
      const body = req.body;
      let idPengurus = await prisma.akun.findMany({
        where: {
          deletedAt: null,
          roleId: 5,
        },
      });
      let idBsu = await prisma.bsu.findMany({
        where: {
          deletedAt: null,
          status:'Approved',
          isActive:1
        },
      });
      idBsu = idBsu.map(({ idBsu }) => idBsu);
      idPengurus = idPengurus.map(({ idAkun }) => idAkun);
      const isBsu = await prisma.bsu.findFirst({
        where: {
          idBsu: body.idBsu,
          isActive:1
        },
      });
      let data = {
        deletedAt: null,
        bsuId: body.idBsu,
        idPengurus: { in: idPengurus },
      };
      if (!isBsu) {
        data = {
          deletedAt: null,
          idPengurus: { in: idPengurus },
          bsuId: { in: idBsu },
        };
      }
      let model = [];
      if ((isBsu && isBsu.status === "Approved") || !isBsu) {
        model = await prisma.pengurus.findMany({
          where: data,
          include: {
            bsu: true,
          },
        });
      }
      return responseData(200, model, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
