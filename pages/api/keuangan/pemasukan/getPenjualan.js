import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { bsuId } = req.query;

      // Build query filter
      const whereClause = bsuId ? { bsuId: parseInt(bsuId) } : {};

      const data = await prisma.penjualan.findMany({
        where: whereClause,
        orderBy: {
          tanggal: "desc",
        },
      });

      // Grouping data berdasarkan tanggal, nama pengepul, dan bsuId
      const groupedData = data.reduce((acc, item) => {
        const key = `${item.tanggal.toISOString().split("T")[0]}-${item.nama}-${
          item.bsuId
        }`;

        if (!acc[key]) {
          acc[key] = {
            idPenjualan: item.idPenjualan,
            tanggal: item.tanggal,
            tujuan: item.nama, // nama pengepul sebagai uraian
            saldo: 0, // akan diakumulasi
            bsuId: item.bsuId,
            createdAt: item.createdAt,
            items: [], // menyimpan detail items
          };
        }

        acc[key].saldo += item.totalPenjualan;
        acc[key].items.push({
          berat: item.berat,
          harga: item.harga,
          totalPenjualan: item.totalPenjualan,
          jenisSampahId: item.jenisSampahId,
        });

        return acc;
      }, {});

      // Convert object to array
      const mappedData = Object.values(groupedData);

      return responseData(200, mappedData, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
