import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseMessage } from "@/lib/api/responHandler";

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status === 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (req.method !== "POST") {
    return responseMessage(405, "Method not allowed", res);
  }

  try {
    console.log("Received request body:", req.body);
    const { tanggal, nama, bsuId, penjualanItems } = req.body;

    // Validasi input
    if (!tanggal) {
      return responseMessage(400, "Tanggal harus diisi", res);
    }
    if (!nama) {
      return responseMessage(400, "Nama pengepul harus diisi", res);
    }
    if (!bsuId) {
      return responseMessage(400, "Bank Sampah harus dipilih", res);
    }
    if (!Array.isArray(penjualanItems) || penjualanItems.length === 0) {
      return responseMessage(400, "Minimal harus ada 1 item penjualan", res);
    }

    // Validasi setiap item
    for (const item of penjualanItems) {
      const { berat, harga, jenisSampahId } = item;
      if (!berat || berat <= 0) {
        return responseMessage(400, "Berat harus lebih dari 0", res);
      }
      if (!harga || harga <= 0) {
        return responseMessage(400, "Harga harus lebih dari 0", res);
      }
      if (!jenisSampahId) {
        return responseMessage(400, "Jenis sampah harus dipilih", res);
      }
    }

    console.log("Creating penjualan records...");
    const hasilPenjualan = [];
    let totalKeseluruhan = 0;

    // Buat record penjualan untuk setiap item
    for (const item of penjualanItems) {
      const { berat, harga, jenisSampahId } = item;
      const totalPenjualan = parseFloat(berat) * parseFloat(harga);
      totalKeseluruhan += totalPenjualan;

      console.log("Creating penjualan with data:", {
        tanggal: new Date(tanggal),
        nama,
        berat: parseFloat(berat),
        harga: parseFloat(harga),
        totalPenjualan,
        bsuId: parseInt(bsuId),
        jenisSampahId: parseInt(jenisSampahId),
      });

      const penjualan = await prisma.penjualan.create({
        data: {
          tanggal: new Date(tanggal),
          nama,
          berat: parseFloat(berat),
          harga: parseFloat(harga),
          totalPenjualan,
          bsuId: parseInt(bsuId),
          jenisSampahId: parseInt(jenisSampahId),
        },
      });

      hasilPenjualan.push(penjualan);
    }

    // Update saldo BSU
    console.log("Updating BSU saldo...");
    const updatedBsu = await prisma.bsu.update({
      where: { idBsu: parseInt(bsuId) },
      data: {
        saldo: {
          increment: totalKeseluruhan,
        },
      },
    });

    console.log("Successfully created penjualan records:", hasilPenjualan);
    console.log("Successfully updated BSU saldo:", updatedBsu);

    return responseData(
      200,
      {
        message: "Penjualan Sampah berhasil ditambahkan",
        data: {
          penjualan: hasilPenjualan,
          totalPenjualan: totalKeseluruhan,
          saldoBaru: updatedBsu.saldo,
        },
      },
      res
    );
  } catch (error) {
    console.error("Error detail:", error);
    return responseMessage(500, `Internal server error: ${error.message}`, res);
  }
}
