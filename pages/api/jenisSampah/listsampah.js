import prisma from "@/lib/api/prisma"; // Impor Prisma
import { verifyToken } from "@/lib/api/checkAuthentication"; // Verifikasi token
import { responseData, responseMessage } from "@/lib/api/responHandler"; // Respon handler

export default async function handler(req, res) {
  // Verifikasi token untuk otentikasi
  const auth = verifyToken(req, res);
  if (auth.status === 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  // Pastikan hanya menerima request GET
  if (req.method !== "GET") {
    return responseMessage(405, "Method Not Allowed", res);
  }

  try {
    // Ambil ID BSU dari query parameter
    const id = req.query.id;
    if (!id) {
      return responseMessage(400, "Missing id parameter", res);
    }

    // Cari data BSU dengan ID tersebut
    const isBsu = await prisma.bsu.findFirst({
      where: {
        idBsu: parseInt(id), // Gunakan id yang diberikan untuk mencari BSU
      },
    });

    if (!isBsu) {
      return responseMessage(404, "BSU not found", res);
    }

    // Ambil data jenis sampah berdasarkan idBsu
    let jenisSampah;
    if (isBsu) {
      jenisSampah = await prisma.jenissampah.findMany({
        include: {
          hargasampahbsu: {
            where: {
              bsuId: parseInt(id)
            }
          }
        }
      });

      // Transform data to include harga for easy access
      jenisSampah = jenisSampah.map(js => ({
        idJenisSampah: js.idJenisSampah,
        nama: js.nama,
        hargasampahbsu: js.hargasampahbsu[0]?.harga || 0
      }));
    } else {
      jenisSampah = await prisma.jenissampah.findMany({
        select: {
          idJenisSampah: true,
          nama: true
        }
      });
    }
    

    // Kembalikan data jenis sampah dan harga
    return responseData(200, jenisSampah, res);

  } catch (error) {
    // Tangani error
    console.error("Error fetching jenis sampah:", error);
    return responseMessage(500, "Internal Server Error", res);
  }
}
