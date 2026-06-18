import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseMessage } from "@/lib/api/responHandler";
import { updateSaldoNasabah } from "@/lib/api/updateSaldoNasabah";

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (req.method !== "POST") {
    return responseMessage(405, "Method not allowed", res);
  }

  try {
    const { idNasabah, items, buktiFoto } = req.body ?? {};

    if (!idNasabah || !Array.isArray(items) || items.length === 0) {
      return responseMessage(400, "Data transaksi tidak lengkap", res);
    }

    for (const item of items) {
      if (!item?.idJenisSampah || !item?.berat || !item?.harga) {
        return responseMessage(
          400,
          "Data item transaksi tidak lengkap (id sampah, berat, atau harga kosong)",
          res
        );
      }
    }

    const totalHarga = items.reduce(
      (acc, item) => acc + parseFloat(item.harga),
      0
    );

    // Keep existing app behavior: compute next idTransaksi manually.
    const lastTransaksi = await prisma.transaksi.findFirst({
      orderBy: { idTransaksi: "desc" },
      select: { idTransaksi: true },
    });
    const nextId = (lastTransaksi?.idTransaksi || 0) + 1;

    const baseData = {
      idTransaksi: nextId,
      nasabahId: parseInt(idNasabah),
      totalHarga: totalHarga,
      tanggal: new Date(),
    };

    const dataWithBukti =
      typeof buktiFoto === "string" && buktiFoto.trim()
        ? { ...baseData, buktiFoto: buktiFoto.trim() }
        : baseData;

    let transaksi;
    let buktiFotoSaved = false;

    try {
      transaksi = await prisma.transaksi.create({ data: dataWithBukti });
      buktiFotoSaved = Boolean(dataWithBukti.buktiFoto);
    } catch (e) {
      // If server is still using an older Prisma Client (no `buktiFoto`), retry.
      const msg = String(e?.message ?? "");
      if (
        msg.includes("Unknown argument `buktiFoto`") ||
        msg.includes("Unknown argument 'buktiFoto'")
      ) {
        transaksi = await prisma.transaksi.create({ data: baseData });
        buktiFotoSaved = false;
      } else {
        throw e;
      }
    }

    const transaksiDetails = await Promise.all(
      items.map((item) =>
        prisma.transaksidetail.create({
          data: {
            transaksiId: transaksi.idTransaksi,
            jenisSampahId: parseInt(item.idJenisSampah),
            berat: parseFloat(item.berat),
            hargaTotal: parseFloat(item.harga),
          },
        })
      )
    );

    await updateSaldoNasabah(idNasabah);

    return responseData(
      200,
      {
        message: "Transaksi berhasil disimpan dan saldo nasabah diperbarui",
        data: { transaksi, details: transaksiDetails, buktiFotoSaved },
      },
      res
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return responseMessage(
      500,
      `Gagal menyimpan transaksi: ${String(error?.message ?? error)}`,
      res
    );
  }
}
