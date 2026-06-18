import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { updateSaldoNasabah } from "@/lib/api/updateSaldoNasabah";

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  const { id } = req.query;
  if (req.method === "POST") {
    const { statusKonfirmasi } = req.body;
    try {
      const parsedPenarikanId = parseInt(id);
      if (Number.isNaN(parsedPenarikanId)) {
        return responseMessage(400, "ID penarikan tidak valid", res);
      }

      const roleName = auth?.roleName;
      if (roleName !== "bsu" && roleName !== "admin") {
        return responseMessage(403, "Tidak memiliki akses", res);
      }

      if (roleName === "bsu") {
        const bsuId = Number(auth?.idAkun);
        if (!Number.isFinite(bsuId) || bsuId <= 0) {
          return responseMessage(403, "Tidak memiliki akses", res);
        }

        const penarikanForAccess = await prisma.penarikan.findUnique({
          where: {
            idPenarikan: parsedPenarikanId,
          },
          select: {
            idPenarikan: true,
            nasabahId: true,
          },
        });

        if (!penarikanForAccess) {
          return responseMessage(404, "Penarikan tidak ditemukan", res);
        }

        const nasabahForAccess = await prisma.nasabah.findUnique({
          where: {
            idNasabah: penarikanForAccess.nasabahId,
          },
          select: {
            bsuId: true,
          },
        });

        if (!nasabahForAccess) {
          return responseMessage(404, "Nasabah tidak ditemukan", res);
        }

        if (Number(nasabahForAccess.bsuId) !== bsuId) {
          return responseMessage(403, "Tidak memiliki akses", res);
        }
      }

      const update = await prisma.penarikan.update({
        where: {
          idPenarikan: parsedPenarikanId,
        },
        data: {
          statusKonfirmasi,
          tanggalKonfirmasi: new Date(),
        },
      });
      if (statusKonfirmasi === "Berhasil") {
        const penarikan = await prisma.penarikan.findUnique({
          where: {
            idPenarikan: parsedPenarikanId,
          },
          select: {
            nasabahId: true,
            totalPenarikan: true,
          },
        });

        if (!penarikan) {
          return responseMessage(404, "Penarikan tidak ditemukan", res);
        }

        const nasabah = await prisma.nasabah.findUnique({
          where: {
            idNasabah: penarikan.nasabahId,
          },
          select: {
            bsuId: true,
          },
        });

        if (!nasabah) {
          return responseMessage(404, "Nasabah tidak ditemukan", res);
        }

        // Update saldo BSU
        await prisma.bsu.update({
          where: {
            idBsu: nasabah.bsuId,
          },
          data: {
            saldo: {
              decrement: penarikan.totalPenarikan,
            },
          },
        });

        // Update saldo nasabah menggunakan fungsi utilitas
        await updateSaldoNasabah(penarikan.nasabahId);
      }
      return responseData(200, update, res);
    } catch (error) {
      console.error("Error fetching data:", error);
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(405, "Method not allowed", res);
  }
}
