import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";
import { z } from "zod";
import Bsu from "@/pages/signup/bsu";

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }
  if (req.method === "GET") {
    try {
      const model =
        await prisma.$queryRaw`select b.*, a.password, a.roleId, a.foto FROM simbaci.akun as a INNER JOIN simbaci.bsu as b on a.idAkun = b.idBsu`;
      return responseData(200, model, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
