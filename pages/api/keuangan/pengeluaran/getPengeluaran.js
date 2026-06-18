import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { bsuId } = req.query;

      // Build query filter
      const whereClause = bsuId ? { bsuId: parseInt(bsuId) } : {};

      const data = await prisma.pengeluaran.findMany({
        where: whereClause,
        orderBy: {
          tanggal: "desc",
        },
      });

      return responseData(200, data, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
