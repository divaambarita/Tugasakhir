import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseError, responseMessage } from "@/lib/api/responHandler";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";

export default async function handler(req, res) {
    const auth = verifyToken(req, res);
    if (auth.status == 401) {
      return responseMessage(auth.status, auth.message, res);
    }
    const { id } = req.query;
  if (req.method === "GET") {
    try {
      const model = await prisma.pengurus.findFirst({
        where: {
          deletedAt: null,
          idPengurus: parseInt(id),
        },
        include:{
            bsu:true
        }
      });
      return responseData(
        200,
       model,
        res
      );
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else if(req.method === 'DELETE'){
    const model = await prisma.pengurus.findFirst({
      where: {
        deletedAt: null,
        idPengurus: parseInt(id),
      },
    });
    if (!model) {
      return responseMessage(503, "Gagal menghapus data. Akun tidak ditemukan", res);
    }

    await prisma.pengurus.delete({
      where: {
        deletedAt: null,
        idPengurus: parseInt(id),
      },
    })
    await prisma.akun.delete({
      where: {
        deletedAt: null,
        idAkun: parseInt(id),
      },
    })
    return responseMessage(200, "Data berhasil dihapus", res);
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
