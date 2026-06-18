import prisma from '@/lib/api/prisma'
import { verifyToken } from '@/lib/api/checkAuthentication'
import { responseData, responseMessage } from '@/lib/api/responHandler'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return responseMessage(405, 'Method not allowed', res)
  }

  // const auth = verifyToken(req, res)
  // if (auth.status == 401) {
  //   return responseMessage(auth.status, auth.message, res)
  // }

  try {
    const { date } = req.query
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    const transactions = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        idTransaksi: true,
        tanggal: true,
        nasabah: {
          select: {
            nama: true,
          },
        },
        transaksidetail: {
          select: {
            transaksiId: true,
            jenisSampahId: true,
            berat: true,
            hargaTotal: true,
            jenissampah: {
              select: {
                nama: true,
                hargasampahbsi: {
                  select: {
                    harga: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    })

    // Transform data untuk frontend
    const transformedTransactions = transactions.map((transaction) => {
      const details = transaction.transaksidetail
      const totalBerat = details.reduce(
        (sum, detail) => sum + (detail.berat || 0),
        0
      )
      const totalHarga = details.reduce(
        (sum, detail) => sum + (detail.hargaTotal || 0),
        0
      )

      return {
        idTransaksi: transaction.idTransaksi,
        nasabah: {
          nama: transaction.nasabah?.nama || '-',
        },
        berat: Number(totalBerat).toFixed(2),
        totalHarga: totalHarga,
        transaksidetail: details,
      }
    })

    return responseData(200, transformedTransactions, res)
  } catch (error) {
    console.error("Error fetching today's transactions:", error)
    return responseMessage(500, 'Internal server error', res)
  }
}
