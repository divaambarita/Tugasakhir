import prisma from "@/lib/api/prisma";

export default async function handler(req, res) {
  try {
    const { idBsu } = req.query;
    const nasabah = await prisma.nasabah.findMany({
      where: idBsu ? { bsuId: idBsu } : {},
      select: {
        nomorNasabah: true,
        nama: true,
        transaksi: {
          select: {
            totalHarga: true,
            transaksidetail: { select: { berat: true } }
          }
        }
      }
    });

    const leaderboard = nasabah.map((n) => {
      const totalTabungan = n.transaksi.reduce(
        (sum, t) => sum + (t.totalHarga || 0), 0
      );
      const totalSampah = n.transaksi.reduce(
        (sum, t) => sum + t.transaksidetail.reduce((s, d) => s + (d.berat || 0), 0), 0
      );
      return {
        nomorNasabah: n.nomorNasabah,
        nama: n.nama,
        totalTabungan,
        totalSampah,
      };
    });

    leaderboard.sort((a, b) => b.totalSampah - a.totalSampah);

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}