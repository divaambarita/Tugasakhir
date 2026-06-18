import prisma from "./prisma";

/**
 * Fungsi untuk memperbarui saldo nasabah berdasarkan total transaksi
 * @param {number} nasabahId - ID nasabah yang akan diperbarui saldonya
 * @returns {Promise<number>} - Saldo baru yang dihitung
 */
export async function updateSaldoNasabah(nasabahId) {
  try {
    // Hitung total dari semua transaksi nasabah
    const totalTransaksiNasabah = await prisma.transaksi.aggregate({
      where: {
        nasabahId: parseInt(nasabahId),
      },
      _sum: {
        totalHarga: true,
      },
    });

    // Hitung total penarikan yang sudah disetujui (sekarang semua penarikan langsung berhasil)
    const totalPenarikan = await prisma.penarikan.aggregate({
      where: {
        nasabahId: parseInt(nasabahId),
        statusKonfirmasi: "Berhasil",
      },
      _sum: {
        totalPenarikan: true,
      },
    });

    // Saldo = Total Transaksi - Total Penarikan yang Berhasil
    const saldoBaru =
      (totalTransaksiNasabah._sum.totalHarga || 0) -
      (totalPenarikan._sum.totalPenarikan || 0);

    // Update saldo nasabah
    await prisma.nasabah.update({
      where: {
        idNasabah: parseInt(nasabahId),
      },
      data: {
        saldo: saldoBaru,
      },
    });

    console.log(
      `Saldo nasabah ${nasabahId} berhasil diperbarui ke: ${saldoBaru}`
    );
    return saldoBaru;
  } catch (error) {
    console.error("Error updating saldo nasabah:", error);
    throw error;
  }
}

/**
 * Fungsi untuk memperbarui saldo semua nasabah di sistem
 * Berguna untuk sinkronisasi data secara batch
 * @returns {Promise<void>}
 */
export async function updateAllSaldoNasabah() {
  try {
    // Ambil semua nasabah
    const allNasabah = await prisma.nasabah.findMany({
      select: {
        idNasabah: true,
      },
    });

    // Update saldo setiap nasabah
    const promises = allNasabah.map((nasabah) =>
      updateSaldoNasabah(nasabah.idNasabah)
    );
    await Promise.all(promises);

    console.log(`Berhasil memperbarui saldo ${allNasabah.length} nasabah`);
  } catch (error) {
    console.error("Error updating all saldo nasabah:", error);
    throw error;
  }
}
