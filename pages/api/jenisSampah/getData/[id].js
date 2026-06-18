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

  if (req.method !== "GET") {
    return responseMessage(405, "Method Not Allowed", res);
  }

  try {
    const id = req.query.id;
    const isBsu = await prisma.bsu.findFirst({
      where: {
        idBsu: parseInt(id),
      },
    });
    let jenisSampah = [];
    if (!isBsu) {
      jenisSampah = await prisma.$queryRaw`
        SELECT j.*, bsi.harga as hargasampahbsi, DATE_FORMAT(j.updatedAt, '%Y-%m-%d %H:%i:%s') as lastUpdate FROM simbaci.jenissampah as j LEFT JOIN simbaci.hargasampahbsi as bsi on j.idJenisSampah = bsi.jenisSampahId`;
    } else {
      jenisSampah = await prisma.$queryRaw`
        SELECT j.*, bsi.harga as hargasampahbsi, bsu.harga as hargasampahbsu, DATE_FORMAT(bsu.updatedAt, '%Y-%m-%d %H:%i:%s') as lastUpdate FROM simbaci.jenissampah as j LEFT JOIN simbaci.hargasampahbsi as bsi on j.idJenisSampah = bsi.jenisSampahId LEFT JOIN simbaci.hargasampahbsu as bsu
        ON j.idJenisSampah = bsu.jenisSampahId and bsu.bsuId = ${parseInt(id)}
        WHERE
        bsu.bsuId = ${parseInt(id)}
      `;
    }
    const data = {
      bsu: isBsu ? jenisSampah : [],
      bsi: isBsu ? [] : jenisSampah,
    };

    return responseData(200, data, res);
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}
