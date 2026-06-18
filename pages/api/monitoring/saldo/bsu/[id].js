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
    const { id } = req.query
    try {
      const data = await prisma.nasabah.findMany({
        where: {
          bsuId: parseInt(id),
        },
        select: {
          idNasabah: true,
          nama: true,
          alamat: true,
          saldo: true,
        },
        orderBy: {
          saldo: 'desc',
        },
      })
      return responseData(200, data, res)
    } catch (error) {
      return responseError(500, error.message, res)
    }
  } else {
    return responseMessage(405, 'Method Not Allowed', res)
  }
}
