import prisma from '@/lib/api/prisma'
import { verifyToken } from '@/lib/api/checkAuthentication'
import {
  responseData,
  responseError,
  responseMessage,
} from '@/lib/api/responHandler'

const emisi = {
  plastik: 0.5,
  kertas: 0.7,
  logam: 0.9,
  kaca: 0.8,
  b3: 0.6,
  karet: 0.4,
  tekstil: 0.3,
  elektronik: 0.9,
  organik: 0.2,
}

export default async function handler(req, res) {
  // const auth = verifyToken(req, res)
  // if (auth.status == 401) {
  //   return responseMessage(auth.status, auth.message, res)
  // }
  const { id } = req.query
  if (req.method === 'GET') {
    try {
      const transaksi = await prisma.transaksi.findMany({
        where: {
          nasabahId: parseInt(id),
        },
        select: {
          idTransaksi: true,
          nasabahId: true,
          createdAt: true,
        },
      })
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
      })
      const jenisSampah = await prisma.jenissampah.findMany({
        select: {
          idJenisSampah: true,
          nama: true,
          kategori: true,
        },
      })

      const jenisSampahMap = jenisSampah.reduce((acc, js) => {
        acc[js.idJenisSampah] = js
        return acc
      }, {})

      const beratPerKategoriByMonthYear = {}
      const emisiKarbonPerKategoriByMonthYear = {}

      transaksiDetail.forEach((td) => {
        const date = new Date(
          transaksi.find((t) => t.idTransaksi === td.transaksiId).createdAt
        )
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // getMonth() returns 0-11, so we add 1
        const day = date.getDate()
        const key = `${year}-${month}-${day}`
        const kategori = jenisSampahMap[td.jenisSampahId]?.kategori
        if (kategori) {
          if (!beratPerKategoriByMonthYear[key]) {
            beratPerKategoriByMonthYear[key] = { totalKeseluruhan: 0 }
          }
          if (!beratPerKategoriByMonthYear[key][kategori]) {
            beratPerKategoriByMonthYear[key][kategori] = 0
          }
          beratPerKategoriByMonthYear[key][kategori] += td.berat
          beratPerKategoriByMonthYear[key].totalKeseluruhan += td.berat
        }
      })

      Object.keys(beratPerKategoriByMonthYear).forEach((key) => {
        emisiKarbonPerKategoriByMonthYear[key] = { totalKeseluruhan: 0 }
        Object.keys(beratPerKategoriByMonthYear[key]).forEach((kategori) => {
          if (kategori !== 'totalKeseluruhan') {
            const emisiKarbon =
              beratPerKategoriByMonthYear[key][kategori] *
              (emisi[kategori.toLowerCase()] || 0)
            emisiKarbonPerKategoriByMonthYear[key][kategori] = emisiKarbon
            emisiKarbonPerKategoriByMonthYear[key].totalKeseluruhan +=
              emisiKarbon
          }
        })
      })

      const result = {
        beratPerKategoriByMonthYear,
        emisiKarbonPerKategoriByMonthYear,
      }
      return responseData(200, result, res)
    } catch (error) {
      return responseError(500, error.message, res)
    }
  } else {
    return responseError(405, 'Method Not Allowed', res)
  }
}
