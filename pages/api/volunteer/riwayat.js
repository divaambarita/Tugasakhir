import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseMessage } from "@/lib/api/responHandler";

function safeParseJson(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return responseMessage(405, "Method Not Allowed", res);
  }

  const auth = verifyToken(req, res);
  if (auth?.status === 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (auth?.roleName !== "volunteer") {
    return responseMessage(403, "Tidak memiliki akses", res);
  }

  try {
    const volunteerId = Number(auth.idAkun);
    if (!Number.isFinite(volunteerId) || volunteerId <= 0) {
      return responseMessage(401, "Authenticated", res);
    }

    const rows = await prisma.hasilverifikasi.findMany({
      where: {
        deletedAt: null,
        volunteerId,
      },
      include: {
        bsu: {
          select: {
            idBsu: true,
            nama: true,
            alamat: true,
            kecamatan: true,
            kelurahan: true,
            status: true,
            noTelp: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const data = rows.map((row) => ({
      ...row,
      fasilitas: safeParseJson(row.fasilitas),
    }));

    return responseData(200, data, res);
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}

