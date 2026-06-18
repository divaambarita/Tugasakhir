import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const data = await prisma.nasabah.findMany({
        include: {
          transaksi: {
            select: {
              totalHarga: true,
            },
          },
        },
      });

      // Calculate total transactions and total amount for each nasabah
      const dataWithStats = data.map((nasabah) => {
        const totalTransaksi = nasabah.transaksi.length;
        const totalNilaiTransaksi = nasabah.transaksi.reduce(
          (total, transaksi) => {
            return total + (transaksi.totalHarga || 0);
          },
          0
        );

        return {
          ...nasabah,
          totalTransaksi,
          totalNilaiTransaksi,
          // Gunakan saldo yang sudah ada di database atau hitung dari transaksi
          saldo: nasabah.saldo !== null ? nasabah.saldo : totalNilaiTransaksi,
          // Remove the detailed transaksi array to keep response clean
          transaksi: undefined,
        };
      });

      return responseData(200, dataWithStats, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
