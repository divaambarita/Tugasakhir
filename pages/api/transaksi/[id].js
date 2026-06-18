import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseMessage } from "@/lib/api/responHandler";
import storeHandler from "./store";

export default async function handler(req, res) {
  const { method } = req;

  // Defensive: In some environments a POST to `/api/transaksi/store` may be routed
  // to this dynamic handler with `id === 'store'`. Forward it to the real handler.
  if (req?.query?.id === "store" && method === "POST") {
    return storeHandler(req, res);
  }

  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (method === "GET") {
    try {
      const { id, type } = req.query;

      if (!id) {
        return responseMessage(400, "ID user harus diisi", res);
      }

      const parsedUserId = parseInt(id);

      if (isNaN(parsedUserId)) {
        return responseMessage(400, "ID user harus berupa angka", res);
      }

      const roleName = auth?.roleName;
      let nasabahIds = [];

      // Role nasabah: treat `id` as nasabahId and enforce self-access.
      if (roleName === "nasabah") {
        if (auth?.idAkun !== parsedUserId) {
          return responseMessage(403, "Tidak memiliki akses", res);
        }
        nasabahIds = [parsedUserId];
      } else {
        // Default/legacy behavior: treat `id` as bsuId.
        const bsuNasabah = await prisma.nasabah.findMany({
          where: {
            bsuId: parsedUserId,
          },
          select: {
            idNasabah: true,
          },
        });
        nasabahIds = bsuNasabah.map((n) => n.idNasabah);
      }

      if (nasabahIds.length === 0) {
        return responseData(200, [], res);
      }

      if (type === "today") {
        // Get today's date at the start (00:00:00) and end (23:59:59)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Ambil transaksi hari ini HANYA untuk nasabah yang terdaftar di BSU ini
        const result = await prisma.transaksi.findMany({
          where: {
            nasabahId: {
              in: nasabahIds,
            },
            tanggal: {
              gte: today,
              lt: tomorrow,
            },
          },
          include: {
            transaksidetail: true,
            nasabah: {
              select: {
                idNasabah: true,
                nama: true,
              },
            },
          },
          orderBy: {
            tanggal: "desc",
          },
        });

        // Group transactions by nasabah for today
        const groupedByNasabah = result.reduce((acc, t) => {
          const nasabahId = t.nasabahId;

          if (!acc[nasabahId]) {
            acc[nasabahId] = {
              idTransaksi: t.idTransaksi,
              idNasabah: t.nasabahId,
              nama: t.nasabah.nama,
              tanggal: t.tanggal,
              details: [],
              transaksidetail: [],
            };
          }

          // Add all transaction details for this nasabah
          t.transaksidetail.forEach((detail) => {
            acc[nasabahId].details.push({
              berat: detail.berat || 0,
              hargaTotal: detail.hargaTotal || 0,
            });
            
            // Also add complete detail for view dialog
            acc[nasabahId].transaksidetail.push(detail);
          });

          return acc;
        }, {});

        // Transform the grouped data to match the component's expected format
        const transformedData = Object.entries(groupedByNasabah).map(
          ([nasabahId, data]) => {
            // Calculate totals for this nasabah
            const totalBerat = data.details.reduce(
              (sum, detail) => sum + detail.berat,
              0
            );
            const totalHarga = data.details.reduce(
              (sum, detail) => sum + detail.hargaTotal,
              0
            );

            return {
              idTransaksi: data.idTransaksi,
              idNasabah: data.idNasabah,
              nama: data.nama,
              tanggal: data.tanggal.toISOString(),
              beratsampah: totalBerat,
              totalhargasampah: totalHarga,
              transaksidetail: data.transaksidetail,
              nasabah: {
                nama: data.nama,
              },
            };
          }
        );

        return responseData(200, transformedData, res);
      }

      if (type === "all") {
        // Get all transactions HANYA untuk nasabah yang terdaftar di BSU ini
        const result = await prisma.transaksi.findMany({
          where: {
            nasabahId: {
              in: nasabahIds,
            },
          },
          include: {
            transaksidetail: {
              include: {
                jenissampah: true,
              },
            },
            nasabah: {
              select: {
                idNasabah: true,
                nama: true,
              },
            },
          },
          orderBy: {
            tanggal: "desc",
          },
        });

        // Group transactions by date
        const groupedByDate = result.reduce((acc, t) => {
          const date = t.tanggal.toISOString().split("T")[0]; // Get date part only

          if (!acc[date]) {
            acc[date] = {
              idTransaksi: t.idTransaksi,
              idNasabah: t.nasabahId,
              tanggal: t.tanggal,
              details: [],
            };
          }

          // Add all transaction details to this date
          t.transaksidetail.forEach((detail) => {
            acc[date].details.push({
              berat: detail.berat || 0,
              hargaTotal: detail.hargaTotal || 0,
            });
          });

          return acc;
        }, {});

        // Transform the grouped data to match the component's expected format
        const transformedData = Object.entries(groupedByDate).map(
          ([date, data]) => {
            // Calculate totals for this date
            const totalBerat = data.details.reduce(
              (sum, detail) => sum + detail.berat,
              0
            );
            const totalHarga = data.details.reduce(
              (sum, detail) => sum + detail.hargaTotal,
              0
            );

            return {
              idTransaksi: data.idTransaksi,
              idNasabah: data.idNasabah,
              tanggal: data.tanggal.toISOString(),
              beratsampah: totalBerat,
              totalhargasampah: totalHarga,
            };
          }
        );

        return responseData(200, transformedData, res);
      }

      // Default case - Get transactions for this BSU
      // Get all transactions HANYA untuk nasabah yang terdaftar di BSU ini
      const transaksi = await prisma.transaksi.findMany({
        where: {
          nasabahId: {
            in: nasabahIds,
          },
        },
        include: {
          transaksidetail: {
            include: {
              jenissampah: {
                include: {
                  hargasampahbsi: true,
                },
              },
            },
          },
          nasabah: true,
        },
        orderBy: {
          tanggal: "desc",
        },
      });

      // Group transactions by date
      const groupedByDate = transaksi.reduce((acc, t) => {
        const date = t.tanggal.toISOString().split("T")[0]; // Get date part only

        if (!acc[date]) {
          acc[date] = {
            idTransaksi: t.idTransaksi, // Use the first transaction's ID
            idNasabah: t.nasabahId,
            tanggal: t.tanggal,
            details: [],
          };
        }

        // Add all transaction details to this date
        t.transaksidetail.forEach((detail) => {
          acc[date].details.push({
            berat: detail.berat || 0,
            hargaTotal: detail.hargaTotal || 0,
          });
        });

        return acc;
      }, {});

      // Transform the grouped data to match the component's expected format
      const transformedData = Object.entries(groupedByDate).map(
        ([date, data]) => {
          // Calculate totals for this date
          const totalBerat = data.details.reduce(
            (sum, detail) => sum + detail.berat,
            0
          );
          const totalHarga = data.details.reduce(
            (sum, detail) => sum + detail.hargaTotal,
            0
          );

          return {
            idTransaksi: data.idTransaksi,
            idNasabah: data.idNasabah,
            tanggal: data.tanggal.toISOString(),
            beratsampah: totalBerat,
            totalhargasampah: totalHarga,
          };
        }
      );

      return responseData(200, transformedData, res);
    } catch (error) {
      console.error("Error:", error);
      return responseMessage(500, "Terjadi kesalahan pada server", res);
    }
  }

  if (method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return responseMessage(400, "ID transaksi harus diisi", res);
      }

      const parsedTransaksiId = parseInt(id);

      if (isNaN(parsedTransaksiId)) {
        return responseMessage(400, "ID transaksi harus berupa angka", res);
      }

      // Delete all transaction details first
      await prisma.transaksidetail.deleteMany({
        where: {
          transaksiId: parsedTransaksiId,
        },
      });

      // Then delete the transaction
      await prisma.transaksi.delete({
        where: {
          idTransaksi: parsedTransaksiId,
        },
      });

      return responseMessage(200, "Transaksi berhasil dihapus", res);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      if (error.code === "P2025") {
        return responseMessage(404, "Transaksi tidak ditemukan", res);
      }
      return responseMessage(
        500,
        "Terjadi kesalahan saat menghapus transaksi",
        res
      );
    }
  }

  return responseMessage(405, "Method tidak diizinkan", res);
}
