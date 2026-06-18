import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseMessage } from "@/lib/api/responHandler";
import { updateSaldoNasabah } from "@/lib/api/updateSaldoNasabah";

export default async function handler(req, res) {
  const { method } = req;
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (method === "PUT") {
    try {
      const { transaksiId, oldJenisSampahId } = req.query;
      const { jenisSampahId, beratsampah } = req.body;

      console.log("Request Data:", {
        transaksiId,
        oldJenisSampahId,
        jenisSampahId,
        beratsampah,
      });

      if (
        !transaksiId ||
        !oldJenisSampahId ||
        isNaN(parseInt(transaksiId)) ||
        isNaN(parseInt(oldJenisSampahId))
      ) {
        return responseMessage(
          400,
          "ID transaksi dan jenis sampah tidak valid",
          res
        );
      }

      // Validasi input
      if (!jenisSampahId || !beratsampah) {
        return responseMessage(
          400,
          "Jenis sampah dan berat sampah harus diisi",
          res
        );
      }

      if (beratsampah <= 0) {
        return responseMessage(400, "Berat sampah harus lebih dari 0", res);
      }

      // Cek apakah transaksi detail exists
      const existingDetail = await prisma.transaksidetail.findUnique({
        where: {
          transaksiId_jenisSampahId: {
            transaksiId: parseInt(transaksiId),
            jenisSampahId: parseInt(oldJenisSampahId),
          },
        },
      });

      if (!existingDetail) {
        return responseMessage(404, "Detail transaksi tidak ditemukan", res);
      }

      // Get transaction data to check the account type and BSU ownership
      const transaction = await prisma.transaksi.findFirst({
        where: {
          idTransaksi: parseInt(transaksiId),
        },
        include: {
          nasabah: true,
        },
      });

      if (!transaction) {
        return responseMessage(404, "Transaksi tidak ditemukan", res);
      }

      // Verify BSU ownership - only allow updating transactions from the same BSU
      const userId = auth.idAkun;
      if (transaction.nasabah.bsuId !== userId) {
        return responseMessage(403, "Tidak memiliki akses untuk mengupdate transaksi ini", res);
      }

      // Determine if this is BSU or BSI transaction
      const isBsu = transaction.nasabah.bsuId !== null;

      // Get harga based on account type
      let hargaSampah;
      if (isBsu) {
        hargaSampah = await prisma.hargasampahbsu.findFirst({
          where: {
            jenisSampahId: parseInt(jenisSampahId),
          },
        });
      } else {
        hargaSampah = await prisma.hargasampahbsi.findFirst({
          where: {
            jenisSampahId: parseInt(jenisSampahId),
          },
        });
      }

      if (!hargaSampah) {
        return responseMessage(
          404,
          `Harga sampah ${isBsu ? "BSU" : "BSI"} tidak ditemukan`,
          res
        );
      }

      // Calculate new total price
      const hargasatuan = parseFloat(hargaSampah.harga);
      const beratsampahFloat = parseFloat(beratsampah);
      const totalhargasampah = hargasatuan * beratsampahFloat;

      console.log("Price calculation:", {
        hargasatuan,
        beratsampah: beratsampahFloat,
        totalhargasampah,
      });

      if (isNaN(totalhargasampah)) {
        console.error("Invalid price calculation:", {
          hargasatuan,
          beratsampah: beratsampahFloat,
          totalhargasampah,
        });
        return responseMessage(400, "Gagal menghitung total harga", res);
      }

      console.log("Updating transaction detail:", {
        oldTransaksiId: parseInt(transaksiId),
        oldJenisSampahId: parseInt(oldJenisSampahId),
        newJenisSampahId: parseInt(jenisSampahId),
        newBerat: beratsampahFloat,
        hargasatuan,
        newHargaTotal: totalhargasampah,
      });

      try {
        // Delete old record
        await prisma.transaksidetail.delete({
          where: {
            transaksiId_jenisSampahId: {
              transaksiId: parseInt(transaksiId),
              jenisSampahId: parseInt(oldJenisSampahId),
            },
          },
        });

        // Create new record with explicit decimal values
        const updatedDetail = await prisma.transaksidetail.create({
          data: {
            transaksi: {
              connect: {
                idTransaksi: parseInt(transaksiId),
              },
            },
            jenissampah: {
              connect: {
                idJenisSampah: parseInt(jenisSampahId),
              },
            },
            berat: beratsampahFloat,
            hargaTotal: totalhargasampah,
          },
          include: {
            transaksi: true,
            jenissampah: true,
          },
        });

        // Update total harga in transaksi
        const allDetails = await prisma.transaksidetail.findMany({
          where: {
            transaksiId: parseInt(transaksiId),
          },
        });

        const totalHargaTransaksi = allDetails.reduce((total, detail) => {
          return total + (detail.hargaTotal || 0);
        }, 0);

        await prisma.transaksi.update({
          where: {
            idTransaksi: parseInt(transaksiId),
          },
          data: {
            totalHarga: totalHargaTransaksi,
          },
        });

        // Update saldo nasabah menggunakan fungsi utilitas
        await updateSaldoNasabah(transaction.nasabah.idNasabah);

        console.log("Created detail:", updatedDetail);
        return responseMessage(
          200,
          "Detail transaksi berhasil diupdate dan saldo nasabah diperbarui",
          res
        );
      } catch (dbError) {
        console.error("Database operation error:", dbError);
        return responseMessage(
          500,
          "Gagal mengupdate detail transaksi di database",
          res
        );
      }
    } catch (error) {
      console.error("Error updating transaction detail:", error);
      return responseMessage(
        500,
        "Terjadi kesalahan saat mengupdate detail transaksi",
        res
      );
    }
  }

  return responseMessage(405, "Method tidak diizinkan", res);
}
