import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";

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

      // Query tanpa include karena relasi tidak terdefinisi di schema
      const penarikanList = await prisma.penarikan.findMany({
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
        "Found penarikan data:",
        penarikanWithNasabah.length,
        "records"
      );

      // Jika tidak ada data, berikan array kosong
      if (penarikanWithNasabah.length === 0) {
        console.log("No penarikan data found, returning empty array");
        return responseData(200, [], res);
      }

      return responseData(200, penarikanWithNasabah, res);
    } catch (error) {
      console.error("Error fetching data:", error);
      return responseMessage(500, `Database error: ${error.message}`, res);
    }
  } else if (req.method === "POST") {
    try {
      const { idBsu } = req.body;

      if (!idBsu) {
        return responseMessage(400, "ID BSU harus disediakan", res);
      }

      // Ambil daftar nasabah berdasarkan BSU terlebih dahulu
      const nasabahList = await prisma.nasabah.findMany({
        where: { bsuId: parseInt(idBsu) },
        select: { idNasabah: true, nama: true, bsuId: true },
      });

      const nasabahIds = nasabahList.map((n) => n.idNasabah);

      // Ambil data penarikan berdasarkan nasabah IDs
      const penarikanList = await prisma.penarikan.findMany({
        where: {
          nasabahId: {
            in: nasabahIds,
          },
        },
        orderBy: {
          tanggalPenarikan: "desc",
        },
      });

      // Gabungkan dengan data nasabah
      const penarikanWithNasabah = penarikanList.map((penarikan) => {
        const nasabah = nasabahList.find(
          (n) => n.idNasabah === penarikan.nasabahId
        );
        return {
          ...penarikan,
          nasabah,
        };
      });

      return responseData(200, penarikanWithNasabah, res);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      return responseMessage(500, `Database error: ${error.message}`, res);
    }
  } else {
    return responseMessage(405, "Method Not Allowed", res);
  }
}
