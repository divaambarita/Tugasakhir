import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { updateSaldoNasabah } from "@/lib/api/updateSaldoNasabah";

export default async function handler(req, res) {
  const { method } = req;
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (method === "DELETE") {
    try {
      const { id } = req.query; // transaksiId
      const { nasabahId, tanggal } = req.body;

      console.log("API received:", {
        id,
        nasabahId,
        tanggal,
        body: req.body,
      });

      // If tanggal is provided, use it. Otherwise, use today's date
      let startDate, endDate;

      if (tanggal) {
        startDate = new Date(tanggal);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      } else {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      }

      console.log("Date range:", {
        startDate,
        endDate,
      });

      // First, find all transactions for this nasabah on the specific date
      const transactions = await prisma.transaksi.findMany({
        where: {
          nasabahId: parseInt(nasabahId),
          tanggal: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          transaksidetail: true,
        },
      });

      console.log("Found transactions:", transactions);

      if (transactions.length === 0) {
        return responseMessage(404, "Tidak ada transaksi yang ditemukan", res);
      }

      // Delete all transaction details first
      for (const transaction of transactions) {
        console.log(
          "Deleting details for transaction:",
          transaction.idTransaksi
        );
        await prisma.transaksidetail.deleteMany({
          where: {
            transaksiId: transaction.idTransaksi,
          },
        });
      }

      // Then delete the transactions
      console.log("Deleting transactions for date range");
      const deleteResult = await prisma.transaksi.deleteMany({
        where: {
          nasabahId: parseInt(nasabahId),
          tanggal: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      console.log("Delete result:", deleteResult);

      // Update saldo nasabah menggunakan fungsi utilitas
      await updateSaldoNasabah(nasabahId);

      return responseMessage(
        200,
        "Transaksi berhasil dihapus dan saldo nasabah diperbarui",
        res
      );
    } catch (error) {
      console.error("Error deleting transactions:", error);
      return responseMessage(500, error.message, res);
    }
  }

  return responseMessage(405, "Method not allowed", res);
}
