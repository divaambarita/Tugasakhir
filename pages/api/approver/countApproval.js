import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const approved = await prisma.bsu.count({
        where: {
          status: "Approved",
          deletedAt: null,
          NOT: {
            hasilverifikasi: null,
          },
        },
      });
      const waitApv = await prisma.bsu.count({
        where: {
          status: "WaitApv",
          deletedAt: null,
          NOT:{
            hasilverifikasi:null
          }
        },
       
      });
      const rejected = await prisma.bsu.count({
        where: {
          status: "Rejected",
          deletedAt: null,
          NOT:{
            hasilverifikasi:null
          }
        },
      });
      const total = await prisma.bsu.count({
        where: {
          deletedAt: null,
          NOT:{
            hasilverifikasi:null
          }
        },
      });
      const data = {
        total,
        approved,
        waitApv,
        rejected,
      };
      return responseData(200, data, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
