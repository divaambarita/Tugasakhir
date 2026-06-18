import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import {verifyToken} from  "@/lib/api/checkAuthentication"

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const models = await prisma.role.findMany();
      let data = [];
      for (const model of models) {
        model.hakAkses = JSON.parse(model.hakAkses);
        data.push(model);
      }
      return responseData(200, data, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}