import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseMessage } from "@/lib/api/responHandler";

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
    const targetStatus =
      typeof req.query?.status === "string" && req.query.status.trim()
        ? req.query.status.trim()
        : "WaitApv";

    const targetBsuRows = await prisma.bsu.findMany({
      where: {
        deletedAt: null,
        status: targetStatus,
      },
      select: {
        idBsu: true,
      },
    });

    const targetBsuIds = targetBsuRows.map((r) => r.idBsu);
    const totalTarget = targetBsuIds.length;

    if (totalTarget === 0) {
      return responseData(
        200,
        {
          status: targetStatus,
          totalTarget: 0,
          totalSudahSurvey: 0,
          totalBelumSurvey: 0,
          totalSayaSurvey: 0,
        },
        res
      );
    }

    const [totalSudahSurvey, totalSayaSurvey] = await Promise.all([
      prisma.hasilverifikasi.count({
        where: {
          deletedAt: null,
          bsuId: { in: targetBsuIds },
        },
      }),
      prisma.hasilverifikasi.count({
        where: {
          deletedAt: null,
          volunteerId: Number(auth.idAkun),
          bsuId: { in: targetBsuIds },
        },
      }),
    ]);

    const totalBelumSurvey = Math.max(0, totalTarget - totalSudahSurvey);

    return responseData(
      200,
      {
        status: targetStatus,
        totalTarget,
        totalSudahSurvey,
        totalBelumSurvey,
        totalSayaSurvey,
      },
      res
    );
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}

