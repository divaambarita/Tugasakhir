import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { z } from "zod";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === "GET") {
    try {
      const auth = verifyToken(req, res);
      if (auth.status == 401) {
        return responseMessage(auth.status, auth.message, res);
      }
      const bsu = await prisma.bsu.findFirst({
        where:{
          idBsu:parseInt(id)
        },
        include : {
          hasilverifikasi: {
            where:{
              deletedAt:null
            }
          },
          jadwal:true,
          pengurus:true,
        }
      })
      if (bsu.hasilverifikasi) {
        bsu.hasilverifikasi.fasilitas = JSON.parse(bsu.hasilverifikasi.fasilitas)
      }
      return responseData(200, bsu, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else if(req.method === "DELETE"){
    try{
      const isApprove = await prisma.bsu.findFirst({
        where:{
          deletedAt : null,
          idBsu: parseInt(id),
          status: 'WaitApv'
        }
      })
      if (!isApprove) {
        return responseMessage(503, "Gagal Menghapus Data. Akun sudah diverifikasi", res);
      }

      await prisma.hasilverifikasi.deleteMany({
        where:{
          bsuId: parseInt(id)
        }
      })
      return responseMessage(200, "Berhasil Menghapus Data.", res);
    } catch (error){
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
