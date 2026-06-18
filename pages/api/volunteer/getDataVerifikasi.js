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
        status: z.string().optional().nullable(),
      });
      const validate = userSchema.safeParse(req.body);
      if (!validate.success) {
        const error = validate.error.issues;
        return responseError(error, res);
      }
      const status =
        typeof validate.data?.status === "string" && validate.data.status.trim()
          ? validate.data.status.trim()
          : "WaitApv";

      const bsu = await prisma.bsu.findMany({
        where:{
          deletedAt:null,
          status
        },
        include : {
          hasilverifikasi: true,
          jadwal:true,
          pengurus:true,
          nasabah:true,
        },
        orderBy:[{
          updatedAt : 'asc'
        }]
      })
      let data = []
      for (const model of bsu) {
        if (model.hasilverifikasi && model.hasilverifikasi.deletedAt != null) {
          model.hasilverifikasi = null;
        }
        if (model.hasilverifikasi && typeof model.hasilverifikasi.fasilitas === "string") {
          try {
            const parsed = JSON.parse(model.hasilverifikasi.fasilitas);
            model.hasilverifikasi.fasilitas = Array.isArray(parsed) ? parsed : [];
          } catch {
            model.hasilverifikasi.fasilitas = [];
          }
        }
        data.push(model)
      }
      return responseData(200, data, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
