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
  // Set cache control headers to prevent caching
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }
  if (req.method === "POST") {
    try {
      console.log("=== GET NASABAH API DEBUG ===");
      console.log("Request body:", req.body);

      const userSchema = z.object({
        idBsu: z.number().min(1),
      });

      const validate = userSchema.safeParse(req.body);

      if (!validate.success) {
        console.log("Validation error:", validate.error.issues);
        const error = validate.error.issues;
        return responseError(error, res);
      }

      const body = req.body;
      console.log("Searching for BSU with ID:", body.idBsu);

      // Cek apakah BSU dengan ID tersebut ada dan aktif
      const bsu = await prisma.bsu.findFirst({
        where: {
          idBsu: body.idBsu,
          deletedAt: null,
          isActive: 1,
        },
      });

      console.log("BSU found:", bsu);

      if (!bsu) {
        console.log("BSU not found or not active");
        return responseData(200, [], res);
      }

      // Jika BSU ditemukan, cari nasabah yang terdaftar di BSU tersebut
      const nasabahList = await prisma.nasabah.findMany({
        where: {
          bsuId: body.idBsu,
          deletedAt: null,
        },
        include: {
          bsu: {
            select: {
              idBsu: true,
              nama: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log("Nasabah found:", nasabahList.length, "records");
      console.log("First nasabah:", nasabahList[0]);

      return responseData(200, nasabahList, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
