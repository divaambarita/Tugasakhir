import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { updateSaldoNasabah } from "@/lib/api/updateSaldoNasabah";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (req.method === "GET") {
    try {
      console.log("Fetching penarikan data...");

      // Ambil BSU ID dari query parameter atau dari token
      const { bsuId, nasabahId } = req.query;

      // Jika ada nasabahId, kembalikan data penarikan khusus nasabah tsb
      if (nasabahId) {
        const parsedNasabahId = parseInt(nasabahId);
        if (Number.isNaN(parsedNasabahId)) {
          return responseMessage(400, "nasabahId tidak valid", res);
        }

        // Jika yang akses adalah role nasabah, batasi hanya untuk dirinya sendiri
        if (auth?.roleName === "nasabah" && auth?.idAkun !== parsedNasabahId) {
          return responseMessage(403, "Tidak memiliki akses", res);
        }

        const penarikanList = await prisma.penarikan.findMany({
          where: {
            nasabahId: parsedNasabahId,
          },
          orderBy: {
            tanggalPenarikan: "desc",
          },
        });

        const nasabah = await prisma.nasabah.findUnique({
          where: { idNasabah: parsedNasabahId },
          select: { idNasabah: true, nama: true, bsuId: true },
        });

        const penarikanWithNasabah = penarikanList.map((penarikan) => ({
          ...penarikan,
          nasabah,
        }));

        return responseData(200, penarikanWithNasabah, res);
      }

      let targetBsuId = bsuId;

      // Jika tidak ada bsuId di query, ambil dari token user
      if (!targetBsuId) {
        // Untuk role BSU, bawa id dari token
        if (auth?.roleName === "bsu" && auth?.idAkun) {
          targetBsuId = auth.idAkun;
        }
      }

      let penarikanList;

      if (targetBsuId) {
        console.log("Filtering penarikan for BSU ID:", targetBsuId);

        // Ambil daftar nasabah yang terdaftar pada BSU tertentu
        const nasabahList = await prisma.nasabah.findMany({
          where: { bsuId: parseInt(targetBsuId) },
          select: { idNasabah: true, nama: true, bsuId: true },
        });

        const nasabahIds = nasabahList.map((n) => n.idNasabah);

        if (nasabahIds.length === 0) {
          console.log("No nasabah found for BSU ID:", targetBsuId);
          return responseData(200, [], res);
        }

        // Query penarikan hanya untuk nasabah dari BSU tersebut
        penarikanList = await prisma.penarikan.findMany({
          where: {
            nasabahId: {
              in: nasabahIds,
            },
          },
          orderBy: {
            tanggalPenarikan: "desc",
          },
        });

        // Gabungkan dengan data nasabah yang sudah di-cache
        const penarikanWithNasabah = penarikanList.map((penarikan) => {
          const nasabah = nasabahList.find(
            (n) => n.idNasabah === penarikan.nasabahId
          );
          return {
            ...penarikan,
            nasabah,
          };
        });

        console.log(
          "Found filtered penarikan data:",
          penarikanWithNasabah.length,
          "records for BSU",
          targetBsuId
        );
        return responseData(200, penarikanWithNasabah, res);
      } else {
        console.log("No BSU filter applied, fetching all penarikan data");

        // Query untuk mengambil semua data penarikan (fallback)
        penarikanList = await prisma.penarikan.findMany({
          orderBy: {
            tanggalPenarikan: "desc",
          },
        });

        // Ambil data nasabah secara terpisah
        const penarikanWithNasabah = await Promise.all(
          penarikanList.map(async (penarikan) => {
            const nasabah = await prisma.nasabah.findUnique({
              where: { idNasabah: penarikan.nasabahId },
              select: {
                nama: true,
                bsuId: true,
              },
            });

            return {
              ...penarikan,
              nasabah,
            };
          })
        );

        console.log(
          "Found all penarikan data:",
          penarikanWithNasabah.length,
          "records"
        );
        return responseData(200, penarikanWithNasabah, res);
      }
      if (penarikanWithNasabah.length === 0) {
        console.log("No penarikan data found, returning empty array");
        return responseData(200, [], res);
      }

      return responseData(200, penarikanWithNasabah, res);
    } catch (error) {
      console.error("Error fetching penarikan data:", error);
      return responseMessage(500, `Database error: ${error.message}`, res);
    }
  }

  if (req.method === "POST") {
    try {
      const {
        nasabahId,
        totalPenarikan,
        metodePembayaran,
        tanggalPenarikan,
        statusKonfirmasi,
      } = req.body;

      // Validasi input
      if (
        !nasabahId ||
        !totalPenarikan ||
        !metodePembayaran ||
        !tanggalPenarikan
      ) {
        return responseMessage(400, "Semua field harus diisi", res);
      }

      const parsedNasabahId = parseInt(nasabahId);
      if (Number.isNaN(parsedNasabahId)) {
        return responseMessage(400, "nasabahId tidak valid", res);
      }

      if (auth?.roleName === "nasabah" && auth?.idAkun !== parsedNasabahId) {
        return responseMessage(403, "Tidak memiliki akses", res);
      }

      const nasabah = await prisma.nasabah.findUnique({
        where: {
          idNasabah: parsedNasabahId,
        },
        select: {
          idNasabah: true,
          bsuId: true,
          saldo: true,
        },
      });

      if (!nasabah) {
        return responseMessage(404, "Nasabah not found", res);
      }

      const totalNum = parseFloat(totalPenarikan);
      if (!Number.isFinite(totalNum) || totalNum <= 0) {
        return responseMessage(400, "totalPenarikan tidak valid", res);
      }

      const currentSaldo = Number(nasabah.saldo ?? 0);
      if (currentSaldo < totalNum) {
        return responseMessage(
          400,
          `Saldo tidak mencukupi untuk penarikan. Saldo tersedia: ${currentSaldo}`,
          res
        );
      }

      const createdStatus =
        auth?.roleName === "nasabah"
          ? "Diproses"
          : statusKonfirmasi && String(statusKonfirmasi).trim()
          ? String(statusKonfirmasi).trim()
          : "Berhasil";

      // Nasabah tidak boleh create dengan status selain Diproses
      if (auth?.roleName === "nasabah" && createdStatus !== "Diproses") {
        return responseMessage(403, "Tidak memiliki akses", res);
      }

      // Gunakan transaction untuk memastikan atomicity
      const result = await prisma.$transaction(async (tx) => {
        const penarikan = await tx.penarikan.create({
          data: {
            nasabahId: parsedNasabahId,
            tanggalPenarikan: new Date(tanggalPenarikan),
            totalPenarikan: totalNum,
            metodePembayaran: metodePembayaran,
            statusKonfirmasi: createdStatus,
            tanggalKonfirmasi:
              createdStatus === "Berhasil" ? new Date() : null,
          },
        });

        if (createdStatus === "Berhasil") {
          await tx.bsu.update({
            where: {
              idBsu: parseInt(nasabah.bsuId),
            },
            data: {
              saldo: {
                decrement: totalNum,
              },
            },
          });
        }

        return penarikan;
      });

      if (createdStatus === "Berhasil") {
        await updateSaldoNasabah(parsedNasabahId);
      }

      return responseData(200, result, res);
    } catch (error) {
      console.error("Error creating penarikan:", error);
      return responseMessage(
        500,
        `Error creating penarikan: ${error.message}`,
        res
      );
    }
  } else {
    return responseMessage(405, "Method not allowed", res);
  }
}
