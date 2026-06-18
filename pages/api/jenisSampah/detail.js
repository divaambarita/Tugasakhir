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

  if (req.method !== "POST") {
    return responseMessage(405, "Method Not Allowed", res);
  }
  const CreateJenisSampahSchema = z.object({
    idJenisSampah: z.number(),
    bsuId: z.number(),
  });

  try {
    const result = CreateJenisSampahSchema.safeParse(req.body);
    if (!result.success) {
      const error = result.error.issues;
      return responseError(error, res);
    }
    const body = req.body;

    const jenisSampah = await prisma.$queryRaw`
    SELECT j.*, bsi.harga as hargasampahbsi, bsu.harga as hargasampahbsu FROM simbaci.jenissampah as j LEFT JOIN simbaci.hargasampahbsi as bsi on j.idJenisSampah = bsi.jenisSampahId LEFT JOIN simbaci.hargasampahbsu as bsu
    ON j.idJenisSampah = bsu.jenisSampahId and bsu.bsuId = ${parseInt(
      body.bsuId
    )}
    WHERE
    j.idJenisSampah = ${parseInt(body.idJenisSampah)}
  `;

    return responseData(
      200,
      jenisSampah.length > 0 ? jenisSampah[0] : null,
      res
    );
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}
