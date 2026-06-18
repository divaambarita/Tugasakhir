import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseError, responseMessage } from "@/lib/api/responHandler";
import { z } from "zod";

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (req.method !== "DELETE") {
    return responseMessage(405, "Method Not Allowed", res);
  }

  const CreatePengeluaranSchema = z.object({
    idPengeluaran: z.number().optional(),
    idPemasukan: z.number().optional(),
  });

  try {
    const result = CreatePengeluaranSchema.safeParse(req.body);
    if (!result.success) {
      const error = result.error.issues;
      return responseError(error, res);
    }
    const body = req.body;

    if (body.idPengeluaran) {
      await prisma.pengeluaran.delete({
        where: {
          idPengeluaran: body.idPengeluaran,
        },
      });
      return responseMessage(200, "Data Pengeluaran Berhasil Dihapus!", res);
    }

    if (body.idPemasukan) {
      await prisma.pemasukan.delete({
        where: {
          idPemasukan: body.idPemasukan,
        },
      });
      return responseMessage(200, "Data Pemasukan Berhasil Dihapus!", res);
    }

    return responseMessage(400, "ID Pengeluaran atau ID Pemasukan harus disertakan", res);
  } catch (error) { 
    return responseMessage(500, error.message, res);
  }
}