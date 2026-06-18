import prisma from '@/lib/api/prisma'
import { verifyToken } from '@/lib/api/checkAuthentication'
import {
  responseData,
  responseError,
  responseMessage,
} from '@/lib/api/responHandler'

export default async function handler(req, res) {
  // const auth = verifyToken(req, res)
  // if (auth.status == 401) {
  //   return responseMessage(auth.status, auth.message, res)
  // }
  if (req.method === 'GET') {
    try {
      const topBsu = await prisma.bsu.findMany({
        where: {
          isActive: 1,
        },
        select: {
          idBsu: true,
          nama: true,
          alamat: true,
          saldo: true,
        },
        orderBy: {
          saldo: 'desc',
        },
      })

      // Tambahkan properti ranking berdasarkan urutan saldo
      const rankedBsu = topBsu.map((bsu, index) => ({
        ...bsu,
        ranking: index + 1,
      }))

      return responseData(200, rankedBsu, res)
    } catch (error) {
      return responseError(500, error.message, res)
    }
  } else {
    return responseMessage(405, 'Method not allowed', res)
  }
}
