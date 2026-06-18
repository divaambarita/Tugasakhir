import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";

const emisi = {
  "Sampah Anorganik (Plastik)": 0.5,
  "Sampah Anorganik (Kertas)": 0.7,
  "Sampah Anorganik (Logam)": 0.9,
  "Sampah Anorganik (Kaca)": 0.8,
  "Limbah B3": 0.6,
  "Sampah Anorganik (Karet)": 0.4,
  "Sampah Anorganik (Tekstil)": 0.3,
  Elektronik: 0.9,
  "Sampah Organik (Mudah Terurai)": 0.2,
};

export default async function handler(req, res) {
  // const auth = verifyToken(req, res)
  // if (auth.status == 401) {
  //   return responseMessage(auth.status, auth.message, res)
  // }
  const { id } = req.query;
  if (req.method === "GET") {
    try {
      const nasabah = await prisma.nasabah.findMany({
        where: {
          bsuId: parseInt(id),
        },
        select: {
          idNasabah: true,
        },
      });
      const totalNasabah = nasabah.length;

      const transaksi = await prisma.transaksi.findMany({
        where: {
          nasabahId: {
            in: nasabah.map((n) => n.idNasabah),
          },
        },
        select: {
          idTransaksi: true,
          nasabahId: true,
          createdAt: true,
          totalHarga: true,
        },
      });

      // Hitung total harga dari semua transaksi
      const totalHargaKeseluruhan = transaksi.reduce(
        (sum, t) => sum + (t.totalHarga || 0),
        0
      );

      const transaksiDetail = await prisma.transaksidetail.findMany({
        where: {
          transaksiId: {
            in: transaksi.map((t) => t.idTransaksi),
          },
        },
        select: {
          transaksiId: true,
          jenisSampahId: true,
          berat: true,
        },
      });
      const jenisSampah = await prisma.jenissampah.findMany({
        select: {
          idJenisSampah: true,
          nama: true,
          kategori: true,
        },
      });

      const jenisSampahMap = jenisSampah.reduce((acc, js) => {
        acc[js.idJenisSampah] = js;
        return acc;
      }, {});

      const beratPerKategoriByMonthYear = {};
      const emisiKarbonPerKategoriByMonthYear = {};

      transaksiDetail.forEach((td) => {
        const date = new Date(
          transaksi.find((t) => t.idTransaksi === td.transaksiId).createdAt
        );
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const key = `${year}-${month}-${day}`;
        const kategori = jenisSampahMap[td.jenisSampahId]?.kategori;
        if (kategori) {
          if (!beratPerKategoriByMonthYear[key]) {
            beratPerKategoriByMonthYear[key] = { totalKeseluruhan: 0 };
          }
          if (!beratPerKategoriByMonthYear[key][kategori]) {
            beratPerKategoriByMonthYear[key][kategori] = 0;
          }
          beratPerKategoriByMonthYear[key][kategori] += td.berat;
          beratPerKategoriByMonthYear[key].totalKeseluruhan += td.berat;
        }
      });

      Object.keys(beratPerKategoriByMonthYear).forEach((key) => {
        emisiKarbonPerKategoriByMonthYear[key] = { totalKeseluruhan: 0 };
        Object.keys(beratPerKategoriByMonthYear[key]).forEach((kategori) => {
          if (kategori !== "totalKeseluruhan") {
            const emisiKarbon =
              beratPerKategoriByMonthYear[key][kategori] *
              (emisi[kategori] || 0);
            emisiKarbonPerKategoriByMonthYear[key][kategori] = emisiKarbon;
            emisiKarbonPerKategoriByMonthYear[key].totalKeseluruhan +=
              emisiKarbon;
          }
        });
      });

      const result = {
        totalNasabah,
        totalHargaKeseluruhan,
        beratPerKategoriByMonthYear,
        emisiKarbonPerKategoriByMonthYear,
      };
      return responseData(200, result, res);
    } catch (error) {
      return responseError(500, error.message, res);
    }
  } else {
    return responseError(405, "Method Not Allowed", res);
  }
}
